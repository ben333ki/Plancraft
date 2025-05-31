package handlers

import (
	"context"
	"log"
	"plancraft/config"
	"plancraft/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetItems returns all items with their recipes
func GetItems(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Step 1: Fetch all items
	cursor, err := config.ItemCollection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch items",
		})
	}
	defer cursor.Close(ctx)

	var items []models.Item
	if err := cursor.All(ctx, &items); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to decode items",
		})
	}

	// Step 2: Fetch all recipes
	var recipes []models.Recipe
	recipeCursor, err := config.RecipeCollection.Find(ctx, bson.M{})
	if err == nil {
		defer recipeCursor.Close(ctx)
		recipeCursor.All(ctx, &recipes)
	}

	// Step 3: Map recipes by recipe_item ID
	recipeMap := make(map[primitive.ObjectID]models.Recipe)
	for _, r := range recipes {
		recipeMap[r.RecipeItem] = r
	}

	// Step 4: Merge items and their recipe
	var itemsWithRecipes []map[string]interface{}
	for _, item := range items {
		itemData := map[string]interface{}{
			"item": item,
		}
		if recipe, ok := recipeMap[item.ItemID]; ok {
			itemData["recipe"] = recipe
		}
		itemsWithRecipes = append(itemsWithRecipes, itemData)
	}


	return c.JSON(fiber.Map{
		"items": itemsWithRecipes,
	})
}

// Recursive helper
func fetchRecipeTree(ctx context.Context, itemID primitive.ObjectID, visited map[string]bool, resultMap map[string]map[string]interface{}) error {
	itemIDHex := itemID.Hex()
	if visited[itemIDHex] {
		return nil
	}
	visited[itemIDHex] = true

	// Fetch item
	var item models.Item
	err := config.ItemCollection.FindOne(ctx, bson.M{"_id": itemID}).Decode(&item)
	if err != nil {
		log.Printf("Item not found for ID: %s", itemIDHex)
		return nil
	}

	itemData := map[string]interface{}{
		"item": item,
	}

	// Try to get the recipe
	var recipe models.Recipe
	err = config.RecipeCollection.FindOne(ctx, bson.M{"recipe_item": itemID}).Decode(&recipe)
	if err == nil {
		itemData["recipe"] = recipe

		// Recurse for each item in crafting grid
		for _, cell := range recipe.CraftingGrid {
			if !cell.ItemInGrid.IsZero() {
				err := fetchRecipeTree(ctx, cell.ItemInGrid, visited, resultMap)
				if err != nil {
					return err
				}
			}
		}
	} else {

	}

	resultMap[itemIDHex] = itemData
	return nil
}

// Handler
func GetRecipeTree(c *fiber.Ctx) error {
	itemIDStr := c.Params("itemID")
	if itemIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing item ID",
		})
	}

	itemID, err := primitive.ObjectIDFromHex(itemIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid item ID format",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	visited := make(map[string]bool)
	resultMap := make(map[string]map[string]interface{})

	err = fetchRecipeTree(ctx, itemID, visited, resultMap)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to build recipe tree",
		})
	}

	// Convert result map to slice
	var result []map[string]interface{}
	for _, v := range resultMap {
		result = append(result, v)
	}

	return c.JSON(fiber.Map{
		"items": result,
	})
}

type CraftRequest struct {
	ItemID string `json:"item_id"`
	Amount int    `json:"amount"`
}

type MaterialCount map[string]int

// CalculateRequiredMaterials returns base materials with required amount
func CalculateRequiredMaterials(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var craftRequests []CraftRequest
	if err := c.BodyParser(&craftRequests); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if len(craftRequests) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No items specified"})
	}

	materials := make(MaterialCount)

	for _, req := range craftRequests {
		if req.ItemID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Item ID is required"})
		}

		itemID, err := primitive.ObjectIDFromHex(req.ItemID)
		if err != nil {
			log.Printf("Invalid item ID format: %s", req.ItemID)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid item ID format"})
		}

		// Verify the item exists
		var item models.Item
		err = config.ItemCollection.FindOne(ctx, bson.M{"_id": itemID}).Decode(&item)
		if err != nil {
			log.Printf("Item not found: %s", req.ItemID)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Item not found"})
		}

		err = collectMaterials(ctx, itemID, req.Amount, materials)
		if err != nil {
			log.Printf("Error collecting materials: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
	}

	// Enrich result with item details
	var result []fiber.Map
	for idStr, qty := range materials {
		itemID, _ := primitive.ObjectIDFromHex(idStr)
		var item models.Item
		err := config.ItemCollection.FindOne(ctx, bson.M{"_id": itemID}).Decode(&item)
		if err != nil {
			continue
		}
		result = append(result, fiber.Map{
			"item_id":    item.ItemID.Hex(),
			"item_name":  item.ItemName,
			"item_image": item.ItemImage,
			"amount":     qty,
		})
	}

	return c.JSON(fiber.Map{
		"required_materials": result,
	})
}

// Recursively collects base materials
func collectMaterials(ctx context.Context, itemID primitive.ObjectID, amount int, result MaterialCount) error {
	var recipe models.Recipe
	err := config.RecipeCollection.FindOne(ctx, bson.M{"recipe_item": itemID}).Decode(&recipe)
	if err != nil {
		// No recipe = base material
		result[itemID.Hex()] += amount
		return nil
	}

	// Multiplier = how many times to craft this recipe
	multiplier := (amount + recipe.RecipeAmount - 1) / recipe.RecipeAmount

	// Count how many times each item appears in the grid
	itemUsage := make(map[primitive.ObjectID]int)
	for _, cell := range recipe.CraftingGrid {
		if cell.ItemInGrid.IsZero() {
			continue
		}
		itemUsage[cell.ItemInGrid] += 1
	}

	for itemInGrid, count := range itemUsage {
		requiredAmount := count * multiplier
		err := collectMaterials(ctx, itemInGrid, requiredAmount, result)
		if err != nil {
			return err
		}
	}

	return nil
}

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

	// Get all items
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

	// For each item, get its recipe
	var itemsWithRecipes []map[string]interface{}
	for _, item := range items {
		var recipe models.Recipe
		err := config.RecipeCollection.FindOne(ctx, bson.M{"recipe_item": item.ItemID}).Decode(&recipe)

		itemData := map[string]interface{}{
			"item": item,
		}

		if err == nil {
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


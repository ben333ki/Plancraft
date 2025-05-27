package handlers

import (
	"context"
	"time"

	"plancraft/config"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Struct for parsing request body
type CreateItemRequest struct {
	ItemName     string `json:"item_name"`
	ItemImage    string `json:"item_image"`
	ItemDesc     string `json:"item_description"`
	ItemCategory string `json:"item_category"`
}

type RecipeInput struct {
	RecipeItem   string `json:"recipe_item"`
	RecipeAmount int    `json:"recipe_amount"`
	CraftingGrid []struct {
		Position   int    `json:"position"`
		ItemInGrid string `json:"item_in_grid"` // can be empty string
	} `json:"crafting_grid"`
}

// POST /create-item
func CreateItem(c *fiber.Ctx) error {
	var body CreateItemRequest
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if body.ItemName == "" || body.ItemCategory == "" || body.ItemImage == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Item name, category, and image are required",
		})
	}

	// Create new item struct
	newItem := models.Item{
		ItemID:       primitive.NewObjectID(),
		ItemName:     body.ItemName,
		ItemImage:    body.ItemImage,
		ItemDesc:     body.ItemDesc,
		ItemCategory: body.ItemCategory,
	}

	// Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	res, err := config.ItemCollection.InsertOne(ctx, newItem)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create item",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Item created successfully",
		"item_id": res.InsertedID,
		"item":    newItem,
	})
}

// POST /create-recipe
func CreateRecipe(c *fiber.Ctx) error {
	var input RecipeInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input",
		})
	}

	recipeItemID, err := primitive.ObjectIDFromHex(input.RecipeItem)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid recipe_item ID",
		})
	}

	var grid []models.CraftingGridCell
	for _, cell := range input.CraftingGrid {
		var itemID primitive.ObjectID
		if cell.ItemInGrid != "" {
			itemID, err = primitive.ObjectIDFromHex(cell.ItemInGrid)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":    "Invalid item_in_grid ID at position",
					"position": cell.Position,
				})
			}
		}
		grid = append(grid, models.CraftingGridCell{
			Position:   cell.Position,
			ItemInGrid: itemID,
		})
	}

	newRecipe := models.Recipe{
		RecipeID:     primitive.NewObjectID(),
		RecipeItem:   recipeItemID,
		RecipeAmount: input.RecipeAmount,
		CraftingGrid: grid,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.RecipeCollection.InsertOne(ctx, newRecipe)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create recipe",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Recipe created successfully",
		"recipe":  newRecipe,
	})
}

// DELETE /delete-recipe/:id
func DeleteRecipe(c *fiber.Ctx) error {
	// Get recipe ID from URL parameter
	recipeID := c.Params("id")
	if recipeID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Recipe ID is required",
		})
	}

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(recipeID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid recipe ID format",
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete recipe from database
	result, err := config.RecipeCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete recipe",
		})
	}

	// Check if recipe was found and deleted
	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Recipe not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Recipe deleted successfully",
	})
}

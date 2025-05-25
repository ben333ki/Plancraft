package handlers

import (
	"context"
	"plancraft/config"
	"plancraft/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
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

package handlers

import (
	"context"
	"log"
	"time"

	"plancraft/config"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateFarm(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var farm models.Farm
	if err := c.BodyParser(&farm); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Validate required fields
	if farm.FarmName == "" || farm.FarmDescription == "" || farm.FarmArea == "" || farm.FarmCategory == "" || farm.FarmVideoURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
	}

	// Validate and convert item IDs if they exist
	if farm.ItemsRequired != nil {
		for _, item := range farm.ItemsRequired {
			if item.ItemID.IsZero() || item.Amount <= 0 {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid required items data"})
			}
			// Verify the item exists
			var itemExists models.Item
			err := config.ItemCollection.FindOne(ctx, bson.M{"_id": item.ItemID}).Decode(&itemExists)
			if err != nil {
				log.Printf("Required item not found: %s", item.ItemID.Hex())
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Required item not found"})
			}
		}
	}

	if farm.ItemsProduced != nil {
		for _, item := range farm.ItemsProduced {
			if item.ItemID.IsZero() || item.Amount <= 0 {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid produced items data"})
			}
			// Verify the item exists
			var itemExists models.Item
			err := config.ItemCollection.FindOne(ctx, bson.M{"_id": item.ItemID}).Decode(&itemExists)
			if err != nil {
				log.Printf("Produced item not found: %s", item.ItemID.Hex())
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Produced item not found"})
			}
		}
	}

	// Insert farm
	res, err := config.FarmCollection.InsertOne(ctx, farm)
	if err != nil {
		log.Printf("Error creating farm: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create farm"})
	}

	farm.FarmID = res.InsertedID.(primitive.ObjectID)

	return c.Status(fiber.StatusCreated).JSON(farm)
}

func GetAllFarms(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.FarmCollection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch farms"})
	}
	defer cursor.Close(ctx)

	var farms []models.Farm
	if err := cursor.All(ctx, &farms); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode farms"})
	}

	return c.JSON(fiber.Map{
		"farms": farms,
	})
}

func DeleteFarm(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get farm ID from URL parameter
	farmID := c.Params("id")
	if farmID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Farm ID is required"})
	}

	// Convert string ID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(farmID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid farm ID"})
	}

	// Delete the farm
	result, err := config.FarmCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		log.Printf("Error deleting farm: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete farm"})
	}

	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Farm not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Farm deleted successfully"})
}

func CalculateFarmMaterials(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var request struct {
		FarmID primitive.ObjectID `json:"farm_id"`
		Amount int                `json:"amount"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Get farm details
	var farm models.Farm
	err := config.FarmCollection.FindOne(ctx, bson.M{"_id": request.FarmID}).Decode(&farm)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Farm not found"})
	}

	// Calculate required materials
	requiredMaterials := make(map[primitive.ObjectID]int)
	for _, item := range farm.ItemsRequired {
		requiredMaterials[item.ItemID] = item.Amount * request.Amount
	}

	// Get item details for the required materials
	var materialsWithDetails []map[string]interface{}
	for itemID, amount := range requiredMaterials {
		var item models.Item
		err := config.ItemCollection.FindOne(ctx, bson.M{"_id": itemID}).Decode(&item)
		if err != nil {
			log.Printf("Error finding item: %v", err)
			continue
		}

		materialsWithDetails = append(materialsWithDetails, map[string]interface{}{
			"item_id":    itemID,
			"item_name":  item.ItemName,
			"item_image": item.ItemImage,
			"amount":     amount,
		})
	}

	return c.JSON(fiber.Map{
		"farm_name": farm.FarmName,
		"materials": materialsWithDetails,
	})
}

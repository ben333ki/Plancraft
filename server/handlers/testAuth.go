package handlers

import (
	"context"
	"plancraft/config"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// TestAuth is a protected route that returns the authenticated user's information
func TestAuth(c *fiber.Ctx) error {
	// Get user ID from context (set by AuthMiddleware)
	userID := c.Locals("user_id").(float64) // JWT claims are stored as float64

	// Fetch user from database
	var user models.User
	if err := config.MongoClient.Database("plancraft").Collection("users").FindOne(context.Background(), bson.M{"user_id": userID}).Decode(&user); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Return user information
	return c.JSON(fiber.Map{
		"message": "You are authenticated!",
		"user": fiber.Map{
			"user_id":         user.UserID,
			"username":        user.Username,
			"email":           user.Email,
			"profile_picture": user.ProfilePicture,
		},
	})
}

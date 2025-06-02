package handlers

import (
	"context"
	"fmt"
	"time"

	"plancraft/config"
	"plancraft/middleware"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func UpdateProfile(c *fiber.Ctx) error {
	// Get user ID from JWT token (as string)
	userIDStr := c.Locals("user_id").(string)
	fmt.Printf("Attempting to update profile for user ID: %s\n", userIDStr)

	// Convert userID string to ObjectID
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		fmt.Printf("Error converting user ID to ObjectID: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	type Request struct {
		Username        string `json:"username"`
		ProfilePicture  string `json:"profile_picture"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	var body Request
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Fetch user from MongoDB
	var user models.User
	err = config.UserCollection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		fmt.Printf("Error finding user in database: %v\n", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	updateFields := bson.M{}

	// Update username if provided
	if body.Username != "" {
		updateFields["username"] = body.Username
		user.Username = body.Username
	}

	// Update profile picture if provided
	if body.ProfilePicture != "" {
		updateFields["profile_picture"] = body.ProfilePicture
		user.ProfilePicture = body.ProfilePicture
	}

	// Update password if provided
	if body.CurrentPassword != "" && body.NewPassword != "" {
		// Verify current password
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.CurrentPassword)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Current password is incorrect",
			})
		}

		// Hash new password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}
		updateFields["password"] = string(hashedPassword)
		user.Password = string(hashedPassword)
	}

	// If there are updates, apply them
	if len(updateFields) > 0 {
		_, err := config.UserCollection.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{"$set": updateFields})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update profile",
			})
		}
	}

	// Generate new token (userID as hex string)
	// Use a default expiration duration (e.g., 3 days) for profile updates
	token, err := middleware.GenerateToken(user.UserID.Hex(), 3*24*time.Hour)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"token":   token,
		"user": fiber.Map{
			"user_id":         user.UserID.Hex(),
			"username":        user.Username,
			"email":           user.Email,
			"profile_picture": user.ProfilePicture,
		},
	})
}

package handlers

import (
	"plancraft/config"
	"plancraft/middleware"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// UpdateProfile handles updating user profile information
func UpdateProfile(c *fiber.Ctx) error {
	// Get user ID from JWT token
	userID := c.Locals("user_id").(float64)

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

	// Fetch the user from database
	var user models.User
	if err := config.DB.First(&user, uint(userID)).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Update username if provided
	if body.Username != "" {
		user.Username = body.Username
	}

	// Update profile picture if provided
	if body.ProfilePicture != "" {
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
		user.Password = string(hashedPassword)
	}

	// Save changes to database
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update profile",
		})
	}

	// Generate new token since user data has changed
	token, err := middleware.GenerateToken(user.UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated successfully",
		"token":   token,
		"user": fiber.Map{
			"user_id":         user.UserID,
			"username":        user.Username,
			"email":           user.Email,
			"profile_picture": user.ProfilePicture,
		},
	})
}

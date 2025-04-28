package handlers

import (
	"plancraft/config"
	"plancraft/models"
	"plancraft/utils"
	"github.com/gofiber/fiber/v2"
)

// Profile: Get user profile data
func Profile(c *fiber.Ctx) error {
	// Get the JWT token from the cookie
	token := c.Cookies("token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "No token provided",
		})
	}

	// Parse and validate the token
	claims, err := utils.ParseJWT(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid or expired token",
		})
	}

	// Extract the user ID from the token claims
	userID := claims["user_id"].(float64) // Claims are typically of type `float64`

	// Fetch the user from the database using the extracted user ID
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Return the user data (including the username)
	return c.JSON(fiber.Map{
		"user_id":         user.UserID,
		"username":        user.Username,
		"email":           user.Email,
		"profile_picture": user.ProfilePicture,
	})
}

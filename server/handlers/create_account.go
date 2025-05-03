package handlers

import (
	"plancraft/config"
	"plancraft/middleware"
	"plancraft/models"
	"regexp"

	"github.com/gofiber/fiber/v2"

	"golang.org/x/crypto/bcrypt"
)

// CreateAccount: Register a new user (and login immediately)
func CreateAccount(c *fiber.Ctx) error {

	type Request struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var body Request
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !re.MatchString(body.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid email format",
		})
	}

	// Check if email already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", body.Email).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email already registered",
		})
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Default profile picture
	defaultProfilePicture := "https://cdn-icons-png.flaticon.com/512/149/149071.png"

	// Create the new user
	newUser := models.User{
		Username:       body.Username,
		Email:          body.Email,
		Password:       string(hashedPassword),
		ProfilePicture: defaultProfilePicture,
	}

	// Save the user to the database
	if err := config.DB.Create(&newUser).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(newUser.UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Respond with user data and token
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Account created successfully",
		"token":   token,
		"user": fiber.Map{
			"user_id":         newUser.UserID,
			"username":        newUser.Username,
			"email":           newUser.Email,
			"profile_picture": newUser.ProfilePicture,
		},
	})
}

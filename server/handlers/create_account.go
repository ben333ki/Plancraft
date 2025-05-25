package handlers

import (
	"context"
	"plancraft/config"
	"plancraft/middleware"
	"plancraft/models"
	"regexp"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// CreateAccount: Register a new user
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
	err := config.UserCollection.FindOne(context.Background(), bson.M{"email": body.Email}).Decode(&existingUser)
	if err == nil {
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

	// Create user document
	newUser := models.User{
		UserID:         primitive.NewObjectID(),
		Username:       body.Username,
		Email:          body.Email,
		Password:       string(hashedPassword),
		ProfilePicture: defaultProfilePicture,
		CreatedAt:      time.Now(),
	}

	// Insert into MongoDB
	_, err = config.UserCollection.InsertOne(context.Background(), newUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Generate JWT
	token, err := middleware.GenerateToken(newUser.UserID.Hex())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Account created successfully",
		"token":   token,
		"user": fiber.Map{
			"user_id":         newUser.UserID.Hex(),
			"username":        newUser.Username,
			"email":           newUser.Email,
			"profile_picture": newUser.ProfilePicture,
		},
	})
}

package handlers

import (
    "plancraft/config"
    "plancraft/models"
    "plancraft/utils"
    "time"

    "github.com/gofiber/fiber/v2"
    "golang.org/x/crypto/bcrypt"
)

// Login: Authenticate user
func Login(c *fiber.Ctx) error {
    type Request struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    var body Request
    if err := c.BodyParser(&body); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    var user models.User
    // Do not reveal if the email is invalid
    if err := config.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid credentials",
        })
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "error": "Invalid credentials",
        })
    }

    // Create JWT token
    token, err := utils.GenerateJWT(user.UserID)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": "Failed to generate token",
        })
    }

    // Set the JWT token as an HTTP-only cookie
    c.Cookie(&fiber.Cookie{
        Name:     "token",
        Value:    token,
        Expires:  time.Now().Add(72 * time.Hour), // Token expires in 72 hours
        HTTPOnly: true,
        Secure:   false,  // Set to false for local development (use true in production with HTTPS)
        SameSite: "Strict", // Ensure the cookie is only sent with requests to your domain
        Path:     "/",
    })

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "Login successful",
        "user": fiber.Map{
            "user_id":         user.UserID,
            "username":        user.Username,
            "email":           user.Email,
            "profile_picture": user.ProfilePicture,
        },
    })
}

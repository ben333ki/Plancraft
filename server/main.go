package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"plancraft/config"
	"plancraft/handlers"
	"plancraft/middleware"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	fmt.Println("Server is running")

	err := godotenv.Load()
	if err != nil {
	  log.Fatal("Error loading .env file")
	}

	// Initialize database connection
	config.InitDatabase()

	// Public routes
	app.Post("/create-account", handlers.CreateAccount)
	app.Post("/login", handlers.Login)

	// Protected routes
	protected := app.Group("/api", middleware.AuthMiddleware())
	protected.Get("/test-auth", handlers.TestAuth) // Test route for JWT authentication

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // fallback
	}

	log.Fatal(app.Listen(":" + port))
}

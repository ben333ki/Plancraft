package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"plancraft/config"
	"plancraft/handlers"
	"plancraft/middleware"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	fmt.Println("Server is running")

	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := config.ConnectMongoDB(ctx); err != nil {
		log.Fatal("MongoDB connection error:", err)
	}

	// Public routes
	app.Post("/create-account", handlers.CreateAccount)
	app.Post("/login", handlers.Login)
	app.Get("/items", handlers.GetItems)

	// Protected routes
	protected := app.Group("/api", middleware.AuthMiddleware())
	protected.Get("/test-auth", handlers.TestAuth)
	protected.Put("/update-profile", handlers.UpdateProfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Fatal(app.Listen(":" + port))
}

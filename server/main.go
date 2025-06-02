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
	// Load .env file if it exists, but don't fail if it doesn't
	_ = godotenv.Load()

	app := fiber.New(fiber.Config{
		AppName: "Plancraft API",
	})

	// Configure CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	fmt.Println("Server is running")

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
	app.Get("/items/:itemID/recipe-tree", handlers.GetRecipeTree)
	app.Post("/items/calculate-materials", handlers.CalculateRequiredMaterials)
	app.Get("/farms", handlers.GetAllFarms)
	app.Post("/farms/calculate-materials", handlers.CalculateFarmMaterials)

	// Protected routes
	protected := app.Group("/api", middleware.AuthMiddleware())
	protected.Get("/test-auth", handlers.TestAuth)
	protected.Put("/update-profile", handlers.UpdateProfile)
	protected.Post("/upload-image", handlers.UploadToCloudinary)
	protected.Post("/create-item", handlers.CreateItem)
	protected.Post("/create-recipe", handlers.CreateRecipe)
	protected.Delete("/delete-recipe/:id", handlers.DeleteRecipe)
	protected.Post("/create-farm", handlers.CreateFarm)
	protected.Delete("/delete-farm/:id", handlers.DeleteFarm)

	// Todo list routes (protected)
	todolist := protected.Group("/todolist/tasks")
	todolist.Get("/", handlers.GetAllTasks)
	todolist.Post("/", handlers.CreateTask)
	todolist.Put("/:id", handlers.UpdateTask)
	todolist.Delete("/:id", handlers.DeleteTask)
	todolist.Patch("/:id/complete", handlers.MarkTaskComplete)
	todolist.Patch("/:id/uncomplete", handlers.MarkTaskUncomplete)
	todolist.Get("/late", handlers.GetLateTasks)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start server with proper error handling
	log.Printf("Starting server on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

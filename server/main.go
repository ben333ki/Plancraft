package main

import (
	"fmt"
	"log"

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

	// Initialize database connection
	config.InitDatabase()

	// Route for creating a new account
	app.Post("/create-account", handlers.CreateAccount)

	// Route for logging in
	app.Post("/login", handlers.Login)

	// Profile route that requires authentication
	app.Get("/profile", middleware.Protected(), handlers.Profile) // Link to the Profile handler

	log.Fatal(app.Listen(":3000"))
}

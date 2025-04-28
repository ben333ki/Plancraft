package config

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"plancraft/models" // <-- import models
)

var DB *gorm.DB

func InitDatabase() {
	dsn := "host=localhost user=postgres password=2306 dbname=plancraft port=5432 sslmode=disable"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL:", err)
	}
	log.Println("Connected to PostgreSQL!")

	// use models.User
	database.AutoMigrate(&models.User{}) 
	DB = database

	log.Println("Database migrated")
}

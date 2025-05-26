package config

import (
	"context"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDB *mongo.Database
var UserCollection *mongo.Collection
var ItemCollection *mongo.Collection
var RecipeCollection *mongo.Collection
var ToDoListCollection *mongo.Collection

func ConnectMongoDB(ctx context.Context) error {
	uri := os.Getenv("MONGODB_URI")
	dbName := os.Getenv("MONGODB_NAME")

	clientOpts := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return err
	}

	MongoClient = client
	MongoDB = client.Database(dbName)

	// Initialize collections
	UserCollection = MongoDB.Collection("users")
	ItemCollection = MongoDB.Collection("items")
	RecipeCollection = MongoDB.Collection("recipes")
	ToDoListCollection = MongoDB.Collection("todolists")

	// Create indexes if they don't exist
	userIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"email": 1,
		},
		Options: options.Index().SetUnique(true),
	}

	itemIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"item_name": 1,
		},
		Options: options.Index().SetUnique(true),
	}

	recipeIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"recipe_item": 1,
		},
		Options: options.Index().SetUnique(true),
	}

	todoListIndexModel := mongo.IndexModel{
		Keys: bson.D{
			{Key: "userID", Value: 1},
			{Key: "title", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	}

	// Create indexes
	_, err = UserCollection.Indexes().CreateOne(ctx, userIndexModel)
	if err != nil {
		return err
	}

	_, err = ItemCollection.Indexes().CreateOne(ctx, itemIndexModel)
	if err != nil {
		return err
	}

	_, err = RecipeCollection.Indexes().CreateOne(ctx, recipeIndexModel)
	if err != nil {
		return err
	}

	_, err = ToDoListCollection.Indexes().CreateOne(ctx, todoListIndexModel)
	if err != nil {
		return err
	}

	return nil
}

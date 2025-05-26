package handlers

import (
	"context"
	"fmt"
	"time"

	"plancraft/config"
	"plancraft/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetAllTasks returns all tasks with optional filtering
func GetAllTasks(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}

	// Optional filters
	if category := c.Query("category"); category != "" {
		filter["category"] = category
	}
	if priority := c.Query("priority"); priority != "" {
		filter["priority"] = priority
	}
	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}
	if search := c.Query("search"); search != "" {
		filter["$or"] = bson.A{
			bson.M{"title": bson.M{"$regex": search, "$options": "i"}},
			bson.M{"category": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	cursor, err := config.ToDoListCollection.Find(ctx, filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch tasks"})
	}
	defer cursor.Close(ctx)

	var tasks []models.ToDoList
	if err := cursor.All(ctx, &tasks); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode tasks"})
	}

	now := time.Now()

	for i, task := range tasks {
		if task.Status == "pending" && task.EndDate.Before(now) {
			// Update task status in DB
			_, err := config.ToDoListCollection.UpdateOne(ctx,
				bson.M{"_id": task.ToDoListID},
				bson.M{"$set": bson.M{"status": "late"}},
			)
			if err != nil {
				fmt.Println("Failed to auto-update task to late:", err)
			} else {
				tasks[i].Status = "late" // Update in memory as well
			}
		}
	}

	return c.JSON(fiber.Map{"tasks": tasks})
}

// CreateTask adds a new task
func CreateTask(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var task models.ToDoList
	if err := c.BodyParser(&task); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input: " + err.Error()})
	}

	// Set default values
	task.ToDoListID = primitive.NewObjectID()
	if task.Status == "" {
		task.Status = "pending"
	}

	result, err := config.ToDoListCollection.InsertOne(ctx, task)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create task: " + err.Error()})
	}

	// Get the created task
	var createdTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": result.InsertedID}).Decode(&createdTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch created task: " + err.Error()})
	}

	return c.Status(201).JSON(createdTask)
}

// UpdateTask modifies an existing task
func UpdateTask(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	var update models.ToDoList
	if err := c.BodyParser(&update); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input: " + err.Error()})
	}

	// Update only the provided fields
	updateFields := bson.M{}
	if update.Title != "" {
		updateFields["title"] = update.Title
	}
	if update.Description != "" {
		updateFields["description"] = update.Description
	}
	if update.Category != "" {
		updateFields["category"] = update.Category
	}
	if update.Priority != "" {
		updateFields["priority"] = update.Priority
	}
	if !update.StartDate.IsZero() {
		updateFields["startDate"] = update.StartDate
	}
	if !update.EndDate.IsZero() {
		updateFields["endDate"] = update.EndDate
	}

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": updateFields})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update task: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	return c.JSON(updatedTask)
}

// DeleteTask removes a task
func DeleteTask(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	_, err = config.ToDoListCollection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete task: " + err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Task deleted successfully"})
}

// MarkTaskComplete sets status to 'complete'
func MarkTaskComplete(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	update := bson.M{
		"$set": bson.M{
			"status":        "complete",
			"completedDate": time.Now(),
		},
	}

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark task as complete: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	return c.JSON(updatedTask)
}

// MarkTaskUncomplete sets status to 'pending' or 'late'
func MarkTaskUncomplete(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	newStatus := "pending"
	if time.Now().After(existingTask.EndDate) {
		newStatus = "late"
	}

	update := bson.M{
		"$set": bson.M{
			"status":        newStatus,
			"completedDate": nil,
		},
	}

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update task status: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	return c.JSON(updatedTask)
}

// GetLateTasks returns all tasks with status 'late'
func GetLateTasks(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.ToDoListCollection.Find(ctx, bson.M{"status": "late"})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch late tasks"})
	}
	defer cursor.Close(ctx)

	var tasks []models.ToDoList
	if err := cursor.All(ctx, &tasks); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode tasks"})
	}

	return c.JSON(fiber.Map{"tasks": tasks})
}

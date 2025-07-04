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

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	filter := bson.M{"userID": userID}

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
				bson.M{"_id": task.ToDoListID, "userID": userID},
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

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var task models.ToDoList
	if err := c.BodyParser(&task); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input: " + err.Error()})
	}

	// Set default values and user ID
	task.ToDoListID = primitive.NewObjectID()
	task.UserID = userID
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

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists and belongs to user
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&existingTask)
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

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id, "userID": userID}, bson.M{"$set": updateFields})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update task: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	// Check and update status based on end date
	now := time.Now()
	if updatedTask.EndDate.Before(now) {
		// Update task status in DB
		_, err := config.ToDoListCollection.UpdateOne(ctx,
			bson.M{"_id": updatedTask.ToDoListID, "userID": userID},
			bson.M{"$set": bson.M{"status": "late"}},
		)
		if err != nil {
			fmt.Println("Failed to auto-update task to late:", err)
		} else {
			updatedTask.Status = "late" // Update in memory as well
		}
	} else {
		// Update task status to pending if end date is in the future
		_, err := config.ToDoListCollection.UpdateOne(ctx,
			bson.M{"_id": updatedTask.ToDoListID, "userID": userID},
			bson.M{"$set": bson.M{"status": "pending"}},
		)
		if err != nil {
			fmt.Println("Failed to auto-update task to pending:", err)
		} else {
			updatedTask.Status = "pending" // Update in memory as well
		}
	}

	return c.JSON(updatedTask)
}

// DeleteTask removes a task
func DeleteTask(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists and belongs to user
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	_, err = config.ToDoListCollection.DeleteOne(ctx, bson.M{"_id": id, "userID": userID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete task: " + err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Task deleted successfully"})
}

// MarkTaskComplete sets status to 'complete'
func MarkTaskComplete(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists and belongs to user
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&existingTask)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	update := bson.M{
		"$set": bson.M{
			"status":        "complete",
			"completedDate": time.Now(),
		},
	}

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id, "userID": userID}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark task as complete: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	return c.JSON(updatedTask)
}

// MarkTaskUncomplete sets status to 'pending' or 'late'
func MarkTaskUncomplete(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	// Check if task exists and belongs to user
	var existingTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&existingTask)
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

	_, err = config.ToDoListCollection.UpdateOne(ctx, bson.M{"_id": id, "userID": userID}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update task status: " + err.Error()})
	}

	// Get the updated task
	var updatedTask models.ToDoList
	err = config.ToDoListCollection.FindOne(ctx, bson.M{"_id": id, "userID": userID}).Decode(&updatedTask)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch updated task: " + err.Error()})
	}

	return c.JSON(updatedTask)
}

// GetLateTasks returns all tasks with status 'late'
func GetLateTasks(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	cursor, err := config.ToDoListCollection.Find(ctx, bson.M{"status": "late", "userID": userID})
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

// GetAllTasksAmount returns the count of tasks by status for the user
func GetAllTasksAmount(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from JWT token
	userIDStr := c.Locals("user_id").(string)
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Create pipeline for aggregation
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"userID": userID,
			},
		},
		{
			"$group": bson.M{
				"_id": "$status",
				"count": bson.M{
					"$sum": 1,
				},
			},
		},
	}

	cursor, err := config.ToDoListCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch task counts"})
	}
	defer cursor.Close(ctx)

	// Process results
	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode task counts"})
	}

	// Convert results to map
	taskCounts := make(map[string]string)
	for _, result := range results {
		status := result["_id"].(string)
		count := result["count"].(int32)
		taskCounts[status] = fmt.Sprintf("%d", count)
	}

	// Ensure all statuses are present in the response
	statuses := []string{"pending", "late", "complete"}
	for _, status := range statuses {
		if _, exists := taskCounts[status]; !exists {
			taskCounts[status] = "0"
		}
	}

	return c.JSON(taskCounts)
}

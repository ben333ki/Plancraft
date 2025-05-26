package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ToDoList struct {
	ToDoListID    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"userID" json:"userID"`
	Title         string             `bson:"title" json:"title"`
	Description   string             `bson:"description" json:"description"`
	Category      string             `bson:"category" json:"category"`
	Priority      string             `bson:"priority" json:"priority"`
	StartDate     time.Time          `bson:"startDate" json:"startDate"`
	EndDate       time.Time          `bson:"endDate" json:"endDate"`
	Status        string             `bson:"status" json:"status"` // "pending", "complete", "late"
	CompletedDate *time.Time         `bson:"completedDate,omitempty" json:"completedDate,omitempty"`
}

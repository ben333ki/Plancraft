package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	UserID         primitive.ObjectID `bson:"_id,omitempty" json:"user_id"`
	Username       string             `bson:"username" json:"username"`
	Email          string             `bson:"email" json:"email"`
	Password       string             `bson:"password" json:"password"`
	ProfilePicture string             `bson:"profile_picture" json:"profile_picture"`
	Role           string             `bson:"role" json:"role"` // "user" or "admin"
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
}

package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ItemAmount struct {
	ItemID primitive.ObjectID `bson:"item_id" json:"item_id"`
	Amount int                `bson:"amount" json:"amount"`
}

type Farm struct {
	FarmID          primitive.ObjectID `bson:"_id,omitempty" json:"farm_id"`
	FarmName        string             `bson:"farm_name" json:"farm_name"`
	FarmDescription string             `bson:"farm_description" json:"farm_description"`
	FarmArea        string             `bson:"farm_area" json:"farm_area"`           // e.g., "16x16x10"
	FarmCategory    string             `bson:"farm_category" json:"farm_category"`   // e.g., "Iron", "Crop", "Animal"
	FarmVideoURL    string             `bson:"farm_video_url" json:"farm_video_url"` // YouTube or other video link
	ItemsRequired   []ItemAmount       `bson:"items_required" json:"items_required"`
	ItemsProduced   []ItemAmount       `bson:"items_produced" json:"items_produced"`
}

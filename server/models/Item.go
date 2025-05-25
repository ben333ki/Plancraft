package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Item struct {
	ItemID        primitive.ObjectID `bson:"_id,omitempty"`
	ItemName      string             `bson:"item_name"`
	ItemImage     string             `bson:"item_image"`
	ItemDesc      string             `bson:"item_description"`
	ItemCategory  string             `bson:"item_category"`
}

type CraftingGridCell struct {
	Position    int                `bson:"position"`        // 1-9 for 3x3 grid
	ItemInGrid  primitive.ObjectID `bson:"item_in_grid"`    // reference to Item._id
}

type Recipe struct {
	RecipeID      primitive.ObjectID  `bson:"_id,omitempty"`
	RecipeItem    primitive.ObjectID  `bson:"recipe_item"`     // Item being crafted
	RecipeAmount  int                 `bson:"recipe_amount"`
	CraftingGrid  []CraftingGridCell  `bson:"crafting_grid"`   // Embedded crafting layout
}

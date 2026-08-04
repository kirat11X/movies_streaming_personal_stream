package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Suggestion struct {
	ID        bson.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID    string        `json:"user_id" bson:"user_id"`
	Title     string        `json:"title" bson:"title" validate:"required,min=1,max=200"`
	Message   string        `json:"message" bson:"message" validate:"max=2000"`
	CreatedAt time.Time     `json:"created_at" bson:"created_at"`
}

package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	database "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/database"
	models "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/models"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/utils"
)

// CreateSuggestion lets any signed-in user propose a title for the catalogue.
func CreateSuggestion(client *mongo.Client) gin.HandlerFunc {
	suggestionCollection := database.OpenCollection(client, "suggestions")
	return func(c *gin.Context) {
		userId, err := utils.GetUserIdFromContext(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User Id not found in context"})
			return
		}

		var body struct {
			Title   string `json:"title" validate:"required,min=1,max=200"`
			Message string `json:"message" validate:"max=2000"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		if err := validate.Struct(body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
			return
		}

		suggestion := models.Suggestion{
			UserID:    userId,
			Title:     body.Title,
			Message:   body.Message,
			CreatedAt: time.Now(),
		}

		ctx, cancel := context.WithTimeout(c, 30*time.Second)
		defer cancel()

		result, err := suggestionCollection.InsertOne(ctx, suggestion)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save suggestion"})
			return
		}

		c.JSON(http.StatusCreated, result)
	}
}

// GetSuggestions lists every suggestion, newest first, for admin review.
func GetSuggestions(client *mongo.Client) gin.HandlerFunc {
	suggestionCollection := database.OpenCollection(client, "suggestions")
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 30*time.Second)
		defer cancel()

		var suggestions []models.Suggestion
		findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
		cursor, err := suggestionCollection.Find(ctx, bson.D{}, findOptions)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		if err := cursor.All(ctx, &suggestions); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": suggestions})
	}
}

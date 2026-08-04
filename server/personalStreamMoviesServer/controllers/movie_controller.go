package controllers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"google.golang.org/api/option"

	database "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/database"
	models "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/models"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/utils"
)

var validate *validator.Validate = validator.New()

func GetMovies(client *mongo.Client) gin.HandlerFunc {
	movieCollection := database.OpenCollection(client, "movies")
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var movies []models.Movie
		cursor, err := movieCollection.Find(ctx, bson.M{})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		if err = cursor.All(ctx, &movies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": movies})
	}
}

func GetMovie(client *mongo.Client) gin.HandlerFunc {
	movieCollection := database.OpenCollection(client, "movies")
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		movieId := c.Param("imdb_id")
		if movieId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie ID is required"})
			return
		}
		var movie models.Movie
		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movieId}).Decode(&movie)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": movie})
	}
}

func AddMovie(client *mongo.Client) gin.HandlerFunc {
	movieCollection := database.OpenCollection(client, "movies")
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movie models.Movie
		if err := c.ShouldBindJSON(&movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if err := validate.Struct(movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
			return
		}

		result, err := movieCollection.InsertOne(ctx, movie)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add movie"})
			return
		}

		c.JSON(http.StatusCreated, result)

	}
}

func AdminReviewUpdate(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		role, err := utils.GetRoleFromContext(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Role not found in context"})
			return
		}

		if role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User must be part of the ADMIN role"})
			return
		}

		movieId := c.Param("imdb_id")
		if movieId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie Id required"})
			return
		}
		var req struct {
			AdminReview string `json:"admin_review"`
		}
		var resp struct {
			RankingName string `json:"ranking_name"`
			AdminReview string `json:"admin_review"`
		}

		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}
		sentiment, rankVal, err := GetReviewRanking(req.AdminReview, client, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting review ranking"})
			return
		}

		filter := bson.D{{Key: "imdb_id", Value: movieId}}

		update := bson.M{
			"$set": bson.M{
				"admin_review": req.AdminReview,
				"ranking": bson.M{
					"ranking_value": rankVal,
					"ranking_name":  sentiment,
				},
			},
		}
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movieCollection *mongo.Collection = database.OpenCollection(client, "movies")

		result, err := movieCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating movie"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
			return
		}
		resp.RankingName = sentiment
		resp.AdminReview = req.AdminReview

		c.JSON(http.StatusOK, resp)

	}
}

// GetReviewRanking uses the Gemini API to classify an admin review into one of
// the configured ranking sentiments.
func GetReviewRanking(admin_review string, client *mongo.Client, c *gin.Context) (string, int, error) {
	rankings, err := GetRankings(client, c)

	if err != nil {
		return "", 0, err
	}

	sentimentDelimited := ""

	for _, ranking := range rankings {
		if ranking.RankingValue != 999 {
			sentimentDelimited = sentimentDelimited + ranking.RankingName + ","
		}
	}

	sentimentDelimited = strings.Trim(sentimentDelimited, ",")

	_ = godotenv.Load(".env")

	geminiAPIKey := os.Getenv("GEMINI_API_KEY")

	if geminiAPIKey == "" {
		return "", 0, errors.New("could not read GEMINI_API_KEY")
	}

	geminiModel := os.Getenv("GEMINI_MODEL")
	if geminiModel == "" {
		geminiModel = "gemini-flash-latest" // sensible default
	}

	ctx, cancel := context.WithTimeout(c, 30*time.Second)
	defer cancel()

	geminiClient, err := genai.NewClient(ctx, option.WithAPIKey(geminiAPIKey))
	if err != nil {
		return "", 0, fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer geminiClient.Close()

	model := geminiClient.GenerativeModel(geminiModel)

	basePromptTemplate := os.Getenv("BASE_PROMPT_TEMPLATE")

	prompt := strings.Replace(basePromptTemplate, "{rankings}", sentimentDelimited, 1) + admin_review

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))

	if err != nil {
		return "", 0, fmt.Errorf("Gemini API call failed: %w", err)
	}

	// Extract the text response from Gemini.
	var response string
	if resp != nil && len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		if textPart, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
			response = strings.TrimSpace(string(textPart))
		}
	}

	if response == "" {
		return "", 0, errors.New("empty response from Gemini")
	}

	// The model is asked for a bare sentiment name, but it occasionally wraps the
	// answer in punctuation, quotes or markdown. Normalise before matching so a
	// cosmetic difference doesn't silently fall through to ranking_value 0.
	normalise := func(s string) string {
		return strings.ToLower(strings.Trim(strings.TrimSpace(s), " \t\n\r.,;:!\"'`*_"))
	}
	cleaned := normalise(response)

	for _, ranking := range rankings {
		if normalise(ranking.RankingName) == cleaned {
			// Return the canonical name from the database, not the model's casing.
			return ranking.RankingName, ranking.RankingValue, nil
		}
	}

	// Fall back to a containment match (e.g. "Sentiment: Excellent").
	for _, ranking := range rankings {
		if name := normalise(ranking.RankingName); name != "" && strings.Contains(cleaned, name) {
			return ranking.RankingName, ranking.RankingValue, nil
		}
	}

	return "", 0, fmt.Errorf("gemini returned %q which matches none of the configured rankings", response)
}

func GetRankings(client *mongo.Client, c *gin.Context) ([]models.Ranking, error) {
	var rankings []models.Ranking

	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	var rankingCollection *mongo.Collection = database.OpenCollection(client, "rankings")

	cursor, err := rankingCollection.Find(ctx, bson.D{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &rankings); err != nil {
		return nil, err
	}

	return rankings, nil

}

// GetRankingsHandler exposes the configured ranking tiers so admin tooling can
// offer a picker instead of asking for a free-text ranking value.
func GetRankingsHandler(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		rankings, err := GetRankings(client, c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": rankings})
	}
}

func GetRecommendedMovies(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User Id not found in context"})
			return
		}

		favourite_genres, err := GetUsersFavouriteGenres(userId, client, c)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		_ = godotenv.Load(".env")

		var recommendedMovieLimitVal int64 = 5

		recommendedMovieLimitStr := os.Getenv("RECOMMENDED_MOVIE_LIMIT")

		if recommendedMovieLimitStr != "" {
			recommendedMovieLimitVal, _ = strconv.ParseInt(recommendedMovieLimitStr, 10, 64)
		}

		findOptions := options.Find()

		findOptions.SetSort(bson.D{{Key: "ranking.ranking_value", Value: 1}})

		findOptions.SetLimit(recommendedMovieLimitVal)

		filter := bson.D{
			{Key: "genre.genre_name", Value: bson.D{
				{Key: "$in", Value: favourite_genres},
			}},
		}

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var movieCollection *mongo.Collection = database.OpenCollection(client, "movies")

		cursor, err := movieCollection.Find(ctx, filter, findOptions)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching recommended movies"})
			return
		}
		defer cursor.Close(ctx)

		recommendedMovies := []models.Movie{}

		if err := cursor.All(ctx, &recommendedMovies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recommendedMovies)
	}
}

func GetUsersFavouriteGenres(userId string, client *mongo.Client, c *gin.Context) ([]string, error) {

	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	filter := bson.D{{Key: "user_id", Value: userId}}

	projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
	}

	opts := options.FindOne().SetProjection(projection)

	// Decode straight into a typed struct: poking at bson.M/bson.A by hand is
	// brittle because nested documents come back as bson.D or bson.M depending
	// on the decoder's ancestor type, which silently yields an empty list.
	var result struct {
		FavouriteGenres []models.Genre `bson:"favourite_genres"`
	}

	var userCollection *mongo.Collection = database.OpenCollection(client, "users")
	err := userCollection.FindOne(ctx, filter, opts).Decode(&result)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return []string{}, nil
		}
		return nil, fmt.Errorf("look up favourite genres: %w", err)
	}

	genreNames := make([]string, 0, len(result.FavouriteGenres))
	for _, genre := range result.FavouriteGenres {
		if genre.GenreName != "" {
			genreNames = append(genreNames, genre.GenreName)
		}
	}

	return genreNames, nil

}

func GetGenres(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var genreCollection *mongo.Collection = database.OpenCollection(client, "genres")

		cursor, err := genreCollection.Find(ctx, bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching movie genres"})
			return
		}
		defer cursor.Close(ctx)

		var genres []models.Genre
		if err := cursor.All(ctx, &genres); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, genres)

	}
}

// Suppress unused import warnings — these are legitimately used above.
var _ = log.Println
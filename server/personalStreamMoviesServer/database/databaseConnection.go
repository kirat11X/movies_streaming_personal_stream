package database

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Connect creates and verifies the MongoDB client used by the personal stream.
// Loading .env is optional so deployments can provide environment variables directly.
func Connect(ctx context.Context) (*mongo.Client, error) {
	_ = godotenv.Load()

	uri := os.Getenv("MONGODB_URI")
	databaseName := os.Getenv("DATABASE")
	if uri == "" || databaseName == "" {
		return nil, fmt.Errorf("MONGODB_URI and DATABASE must be configured")
	}

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, fmt.Errorf("connect to MongoDB: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, fmt.Errorf("ping MongoDB: %w", err)
	}

	return client, nil
}

func OpenCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database(os.Getenv("DATABASE")).Collection(collectionName)
}

package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/database"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/middleware"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/routes"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}

	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.String(200, "Hello, PersonalStream!")
	})

	// Use the hand-written CORS middleware (supports HTTP-only cookie credentials).
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Logger())

	client, err := database.Connect(context.Background())
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()

	routes.SetupUnProtectedRoutes(router, client)
	routes.SetupProtectedRoutes(router, client)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Render requires a service to listen on its injected PORT and on a
	// publicly reachable interface, not only on localhost.
	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

package routes

import (
	"github.com/gin-gonic/gin"
	controller "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/controllers"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())

	protected.GET("/movie/:imdb_id", controller.GetMovie(client))
	protected.POST("/addmovie", middleware.RequireRole("ADMIN"), controller.AddMovie(client))
	protected.PATCH("/movie/:imdb_id/review", middleware.RequireRole("ADMIN"), controller.AdminReviewUpdate(client))
	protected.GET("/recommended", controller.GetRecommendedMovies(client))
	protected.POST("/logout", controller.LogoutHandler(client))
	protected.POST("/suggestions", controller.CreateSuggestion(client))
	protected.GET("/suggestions", middleware.RequireRole("ADMIN"), controller.GetSuggestions(client))
}

package routes

import (
	"github.com/gin-gonic/gin"
	controller "github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/controllers"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupUnProtectedRoutes(router *gin.Engine, client *mongo.Client) {

	router.GET("/movies", controller.GetMovies(client))
	router.POST("/register", controller.RegisterUser(client))
	router.POST("/login", controller.LoginUser(client))
	router.POST("/refresh", controller.RefreshTokenHandler(client))
	router.GET("/genres", controller.GetGenres(client))
	router.GET("/rankings", controller.GetRankingsHandler(client))
}

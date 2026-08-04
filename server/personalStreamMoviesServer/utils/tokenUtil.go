package utils

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kirat11X/movies_streaming_personal_stream/server/personalStreamMoviesServer/database"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const tokenIssuer = "PersonalStreamMoviesServer"

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserId    string
	jwt.RegisteredClaims
}

func secret(name string) ([]byte, error) {
	value := os.Getenv(name)
	if value == "" {
		return nil, fmt.Errorf("%s is not configured", name)
	}
	return []byte(value), nil
}

func GenerateAllTokens(email, firstName, lastName, role, userId string) (string, string, error) {
	accessSecret, err := secret("SECRET_KEY")
	if err != nil {
		return "", "", err
	}
	refreshSecret, err := secret("SECRET_REFRESH_KEY")
	if err != nil {
		return "", "", err
	}

	now := time.Now()
	claims := func(expiration time.Duration) *SignedDetails {
		return &SignedDetails{
			Email: email, FirstName: firstName, LastName: lastName, Role: role, UserId: userId,
			RegisteredClaims: jwt.RegisteredClaims{
				Issuer: tokenIssuer, IssuedAt: jwt.NewNumericDate(now), ExpiresAt: jwt.NewNumericDate(now.Add(expiration)),
			},
		}
	}

	access, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims(24*time.Hour)).SignedString(accessSecret)
	if err != nil {
		return "", "", err
	}
	refresh, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims(7*24*time.Hour)).SignedString(refreshSecret)
	if err != nil {
		return "", "", err
	}
	return access, refresh, nil
}

func UpdateAllTokens(userID, token, refreshToken string, client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := database.OpenCollection(client, "users").UpdateOne(ctx, bson.M{"user_id": userID}, bson.M{
		"$set": bson.M{"token": token, "refresh_token": refreshToken, "updated_at": time.Now()},
	})
	return err
}

func GetAccessToken(c *gin.Context) (string, error) {
	if token, err := c.Cookie("access_token"); err == nil && token != "" {
		return token, nil
	}
	return "", errors.New("access token is required")
}

func parseToken(tokenString, secretName string) (*SignedDetails, error) {
	key, err := secret(secretName)
	if err != nil {
		return nil, err
	}
	claims := &SignedDetails{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return key, nil
	}, jwt.WithIssuer(tokenIssuer))
	if err != nil || !token.Valid {
		if err == nil {
			err = errors.New("invalid token")
		}
		return nil, err
	}
	return claims, nil
}

func ValidateToken(tokenString string) (*SignedDetails, error) {
	return parseToken(tokenString, "SECRET_KEY")
}

func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	return parseToken(tokenString, "SECRET_REFRESH_KEY")
}

func GetUserIdFromContext(c *gin.Context) (string, error) {
	value, exists := c.Get("userId")
	if !exists {
		return "", errors.New("user ID does not exist in this context")
	}
	id, ok := value.(string)
	if !ok || id == "" {
		return "", errors.New("unable to retrieve user ID")
	}
	return id, nil
}

func GetRoleFromContext(c *gin.Context) (string, error) {
	value, exists := c.Get("role")
	if !exists {
		return "", errors.New("role does not exist in this context")
	}
	role, ok := value.(string)
	if !ok || role == "" {
		return "", errors.New("unable to retrieve role")
	}
	return role, nil
}

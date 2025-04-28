package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ดึงค่า SecretKey จาก environment variable
var SecretKey = []byte(os.Getenv("JWT_SECRET_KEY"))

// สร้าง JWT token
func GenerateJWT(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // อายุ 72 ชั่วโมง
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(SecretKey)
}

// เช็กและดึงข้อมูลจาก JWT token
func ParseJWT(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return SecretKey, nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}

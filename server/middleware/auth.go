package middleware

import (
	"plancraft/utils"

	"github.com/gofiber/fiber/v2"
)

// เช็กว่าใน header มี token ไหม และ token ถูกไหม
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization") // ดึงจาก header

		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing or malformed token",
			})
		}

		claims, err := utils.ParseJWT(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid or expired token",
			})
		}

		// เก็บ user_id เอาไว้ใน context เผื่อใช้ต่อได้
		c.Locals("user_id", claims["user_id"])

		return c.Next()
	}
}

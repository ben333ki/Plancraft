package handlers

import (
	"context"
	"net/http"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
)

func UploadToCloudinary(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("No file uploaded")
	}

	// Open uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer file.Close()

	// Cloudinary credentials from env
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUD_NAME"),
		os.Getenv("CLOUD_API_KEY"),
		os.Getenv("CLOUD_API_SECRET"),
	)
	if err != nil {
		return err
	}

	// Upload
	uploadRes, err := cld.Upload.Upload(context.Background(), file, uploader.UploadParams{
		Folder: "Plancraft",
	})
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"imageUrl": uploadRes.SecureURL,
	})
}

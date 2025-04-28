package models

import "time"

type User struct {
	UserID          uint      `json:"user_id" gorm:"primaryKey;autoIncrement"`
	Username        string    `json:"username"`
	Email           string    `json:"email"`
	Password        string    `json:"password"`
	ProfilePicture  string    `json:"profile_picture"`
	CreatedAt       time.Time
}

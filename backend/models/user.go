package models

import "time"

type User struct{
	UserID       uint      `gorm:"primaryKey;autoIncrement" json:"user_id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	RealName     string    `json:"real_name"`
	Points       int       `gorm:"default:0" json:"points"`
	IsVip        bool      `gorm:"default:false" json:"is_vip"`
	CreatedAt    time.Time `json:"created_at"`
}
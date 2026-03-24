package models

import "time"

type User struct{
	UserID       uint      `gorm:"primaryKey;autoIncrement" json:"user_id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	RealName     string    `json:"real_name"`
	Phone        string    `gorm:"size:20" json:"phone"`
	Email        string    `gorm:"size:100" json:"email"`
	IDCard       string    `gorm:"size:18" json:"id_card"`
	IsVerified   bool      `gorm:"default:false" json:"is_verified"`
	Points       int       `gorm:"default:0" json:"points"`
	IsVip        bool      `gorm:"default:false" json:"is_vip"`
	CreatedAt    time.Time `json:"created_at"`
}

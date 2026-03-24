package models

import "time"

type Review struct {
	ReviewID  uint      `gorm:"primaryKey;autoIncrement" json:"review_id"`
	HotelID   uint      `json:"hotel_id"`
	UserID    uint      `json:"user_id"`
	Rating    int       `gorm:"default:5" json:"rating"`
	Content   string    `gorm:"type:text" json:"content"`
	CreatedAt time.Time `json:"created_at"`
	
	User      User      `gorm:"foreignKey:UserID" json:"user"`
}

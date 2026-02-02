package models

// Hotel 酒店表
type Hotel struct{
	HotelID  uint   `gorm:"primaryKey;autoIncrement" json:"hotel_id"`
	Name     string `gorm:"size:100;not null" json:"name"`
	City     string `gorm:"size:50;not null;index" json:"city"`
	District string `gorm:"size:50;not null;index" json:"district"`
	Address  string `gorm:"type:text" json:"address"`
	Rooms    []Room `gorm:"foreignKey:HotelID" json:"rooms"`
}

// Room 客房表
type Room struct{
	RoomID uint `gorm:"primaryKey;autoIncrement" json:"room_id"`
	HotelID uint `json:"hotel_id"`
	RoomType string `gorm:"size:50;not null" json:"room_type"`
	Price float64 `gorm:"type:decimal(10,2);default:0.0" json:"price"`
	Capacity int `gorm:"default:2" json:"capacity"`
	TotalInventory int `gorm:"not null" json:"total_inventory"`
	AvailableInventory int `gorm:"not null" json:"available_inventory"`
}
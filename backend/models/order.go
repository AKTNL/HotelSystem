package models

import "time"

// Order 订单表
type Order struct{
	OrderID uint `gorm:"primaryKey;autoIncrement" json:"order_id"`
	UserID uint `json:"user_id"`
	HotelID uint `json:"hotel_id"`
	RoomType string `gorm:"size:50" json:"room_type"`
	TotalPrice float64 `gorm:"type:decimal(10,2);default:0.0" json:"total_price"`
	Status string `gorm:"size:20'default:'booked'" json:"status"`
	CheckInDate time.Time `gorm:"type:date;not null" json:"check_in_date"`
	CheckOutDate time.Time `gorm:"type:date;not null" json:"check_out_date"`
	CreatedAt time.Time `json:"created_at"`
	
	// 关联：一个订单有多个入住人
	Guests []OrderGuest `gorm:"foreignKey:OrderID" json:"guests"`
}

// OrderGuest 入住人明细表 (用于画像统计)
type OrderGuest struct{
	GuestID uint `gorm:"primaryKey;autoIncrement" json:"guest_id"`
	OrderID uint `json:"order_id"`
	Name string `gorm:"size:50;not null" json:"name"`
	Gender string `gorm:"size:1;default:'M'" json:"gender"`
	IDCard string `gorm:"size:18;not null" json:"id_card"`
	Age int `json:"age"`
	Occupation string `json:"occupation"`
	IncomeLevel string `json:"income_level"`
	Education string `json:"education"`
}
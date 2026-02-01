package controllers

import(
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"github.com/gin-gonic/gin"
	"time"
)

func CreateOrder(c *gin.Context){
	var req struct{
		UserID   uint      `json:"user_id"`
		HotelID  uint      `json:"hotel_id"`
		RoomType string    `json:"room_type"`
		CheckIn  time.Time `json:"check_in"`
		CheckOut time.Time `json:"check_out"`
		Guests   []models.OrderGuest `json:"guests"`
	}

	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error{
		var room models.Room
		if err := tx.Set("gorm:query_option", "for update").
			Where("hotel_id = ? and room_type = ?", req.HotelID, req.RoomType).
			First(&room).Error; err != nil{
			return err
		}

		if room.AvailableInventory <= 0{
			return errors.New("客房已售罄")
		}

		var user models.User
		tx.First(&user, req.UserID)
		finalPrice := room.Price
		if user.IsVip{
			finalPrice = room.Price * 0.8
		}

		newOrder := models.Order{
			UserID: req.UserID,
			HotelID: req.HotelID,
			RoomType: req.RoomType,
			TotalPrice: finalPrice,
			CheckInDate: req.CheckIn,
			CheckOutDate: req.CheckOut,
			Status: "booked",
		}
		if err := tx.Create(&newOrder).Error; err != nil{
			return err
		}

		for i := range req.Guests{
			req.Guests[i].OrderID = newOrder.OrderID
			if err := tx.Create(&req.Guests[i]).Error; err != nil{
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "预订成功"})
}

func CancelOrder(c *gin.Context){
	orderID := c.Param("id")
	userID := c.Query("user_id")

	var order models.Order
	if err := config 
}
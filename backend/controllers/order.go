package controllers

import (
	"errors"
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateOrder(c *gin.Context) {
	var req struct {
		UserID   uint                `json:"user_id"`
		HotelID  uint                `json:"hotel_id"`
		RoomType string              `json:"room_type"`
		CheckIn  string              `json:"check_in"`
		CheckOut string              `json:"check_out"`
		Guests   []models.OrderGuest `json:"guests"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var room models.Room
		if err := tx.Set("gorm:query_option", "for update").
			Where("hotel_id = ? and room_type = ?", req.HotelID, req.RoomType).
			First(&room).Error; err != nil {
			return err
		}

		if room.AvailableInventory <= 0 {
			return errors.New("客房已售罄")
		}

		// 扣减库存
		if err := tx.Model(&room).Update("available_inventory", room.AvailableInventory-1).Error; err != nil {
			return err
		}

		var user models.User
		tx.First(&user, req.UserID)
		finalPrice := room.Price
		if user.IsVip {
			finalPrice = room.Price * 0.8
		}

		checkIn, _ := time.Parse("2006-01-02", req.CheckIn)
		checkOut, _ := time.Parse("2006-01-02", req.CheckOut)

		nights := 0
		if checkOut.After(checkIn) {
			nights = int(checkOut.Sub(checkIn).Hours() / 24)
		}
		totalNights := nights
		if totalNights <= 0 {
			totalNights = 1
		}

		totalPrice := finalPrice * float64(totalNights)

		newOrder := models.Order{
			UserID:       req.UserID,
			HotelID:      req.HotelID,
			RoomType:     req.RoomType,
			TotalPrice:   totalPrice,
			CheckInDate:  checkIn,
			CheckOutDate: checkOut,
			Status:       "booked",
		}
		if err := tx.Create(&newOrder).Error; err != nil {
			return err
		}

		for i := range req.Guests {
			if len(req.Guests[i].IDCard) != 18 {
				return errors.New("入住人身份证号必须为18位")
			}
			req.Guests[i].OrderID = newOrder.OrderID
			if err := tx.Create(&req.Guests[i]).Error; err != nil {
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

func CancelOrder(c *gin.Context) {
	orderID := c.Param("id")
	userID := c.Query("user_id")

	var order models.Order
	if err := config.DB.Where("order_id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在或无权操作"})
		return
	}

	if order.Status != "booked" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "当前订单状态不支持退订"})
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// 更新订单状态
		if err := tx.Model(&order).Update("status", "cancelled").Error; err != nil {
			return err
		}

		// 恢复房间库存
		if err := tx.Model(&models.Room{}).
			Where("hotel_id = ? AND room_type = ?", order.HotelID, order.RoomType).
			UpdateColumn("available_inventory", gorm.Expr("available_inventory + 1")).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "退订失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "退订成功，房间已释放"})
}

func GetUserOrders(c *gin.Context) {
	userID := c.Param("user_id")
	var orders []models.Order

	if err := config.DB.Where("user_id = ?", userID).
		Preload("Guests").
		Order("created_at desc").
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单失败"})
		return
	}

	var hotelIDs []uint
	for _, order := range orders {
		hotelIDs = append(hotelIDs, order.HotelID)
	}

	var hotels []models.Hotel
	if len(hotelIDs) > 0 {
		config.DB.Where("hotel_id IN ?", hotelIDs).Find(&hotels)
	}
	hotelMap := make(map[uint]models.Hotel)
	for _, hotel := range hotels {
		hotelMap[hotel.HotelID] = hotel
	}

	var result []gin.H
	for _, order := range orders {
		hotel := hotelMap[order.HotelID]
		guestNames := []string{}
		for _, g := range order.Guests {
			guestNames = append(guestNames, g.Name)
		}
		result = append(result, gin.H{
			"order": gin.H{
				"order_id":       order.OrderID,
				"user_id":        order.UserID,
				"hotel_id":       order.HotelID,
				"room_type":      order.RoomType,
				"total_price":    order.TotalPrice,
				"status":         order.Status,
				"check_in_date":  order.CheckInDate,
				"check_out_date": order.CheckOutDate,
				"created_at":     order.CreatedAt,
				"guests":         order.Guests,
				"guest_names":    guestNames,
			},
			"hotel": hotel,
		})
	}

	c.JSON(http.StatusOK, result)
}

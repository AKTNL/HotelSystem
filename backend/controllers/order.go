package controllers

import(
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"github.com/gin-gonic/gin"
	"time"
	"errors"
	"gorm.io/gorm"
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

	// 开启事务
	err := config.DB.Transaction(func(tx *gorm.DB) error{
		// 1. 锁定并检查库存 (FOR UPDATE 保证并发安全)
		var room models.Room
		if err := tx.Set("gorm:query_option", "for update").
			Where("hotel_id = ? and room_type = ?", req.HotelID, req.RoomType).
			First(&room).Error; err != nil{
			return err
		}

		if room.AvailableInventory <= 0{
			return errors.New("客房已售罄")
		}

		// 2. 计算优惠价格 (VIP 策略 )
		var user models.User
		tx.First(&user, req.UserID)
		finalPrice := room.Price
		if user.IsVip{
			finalPrice = room.Price * 0.8
		}

		// 3. 创建订单
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

		// 4. 保存入住人信息 
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

// CancelOrder 处理退订请求
func CancelOrder(c *gin.Context){
	orderID := c.Param("id")
	userID := c.Query("user_id")

	var order models.Order
	if err := config.DB.Where("order_id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在或无权操作"})
		return
	} 

	if order.Status != "booked"{
		c.JSON(http.StatusBadRequest, gin.H{"error": "当前订单状态不支持退订"})
		return
	}

	if err := config.DB.Model(&order).Update("status", "cancelled").Error; err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "退订失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "退订成功，房间已释放"})
}

func GetUserOrders(c *gin.Context){
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
	config.DB.Where("hotel_id IN ?", hotelIDs).Find(&hotels)
	hotelMap := make(map[uint]models.Hotel)
	for _, hotel := range hotels {
		hotelMap[hotel.HotelID] = hotel
	}

	var result []gin.H
	for _, order := range orders {
		hotel := hotelMap[order.HotelID]
		result = append(result, gin.H{
			"order": order,
			"hotel": hotel,
		})
	}

	c.JSON(http.StatusOK, result)
}
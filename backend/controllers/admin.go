package controllers

import (
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询用户失败"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	var input struct {
		RealName string `json:"real_name"`
		Points   int    `json:"points"`
		IsVip    bool   `json:"is_vip"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	user.RealName = input.RealName
	user.Points = input.Points
	user.IsVip = input.IsVip

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	result := config.DB.Delete(&models.User{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func CreateHotel(c *gin.Context) {
	var hotel models.Hotel
	if err := c.ShouldBindJSON(&hotel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	if err := config.DB.Create(&hotel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}
	c.JSON(http.StatusOK, hotel)
}

func UpdateHotel(c *gin.Context) {
	id := c.Param("id")
	var hotel models.Hotel
	if err := config.DB.First(&hotel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "酒店不存在"})
		return
	}

	var input models.Hotel
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	hotel.Name = input.Name
	hotel.City = input.City
	hotel.District = input.District
	hotel.Address = input.Address

	if err := config.DB.Save(&hotel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, hotel)
}

func DeleteHotel(c *gin.Context) {
	id := c.Param("id")
	config.DB.Where("hotel_id = ?", id).Delete(&models.Room{})
	result := config.DB.Delete(&models.Hotel{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "酒店不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetAllRooms(c *gin.Context) {
	hotelID := c.Query("hotel_id")
	var rooms []models.Room
	query := config.DB
	if hotelID != "" {
		query = query.Where("hotel_id = ?", hotelID)
	}
	if err := query.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询客房失败"})
		return
	}
	c.JSON(http.StatusOK, rooms)
}

func CreateRoom(c *gin.Context) {
	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	if err := config.DB.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}
	c.JSON(http.StatusOK, room)
}

func UpdateRoom(c *gin.Context) {
	id := c.Param("id")
	var room models.Room
	if err := config.DB.First(&room, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "客房不存在"})
		return
	}

	var input models.Room
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	room.HotelID = input.HotelID
	room.RoomType = input.RoomType
	room.Price = input.Price
	room.Capacity = input.Capacity
	room.TotalInventory = input.TotalInventory
	room.AvailableInventory = input.AvailableInventory

	if err := config.DB.Save(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, room)
}

func DeleteRoom(c *gin.Context) {
	id := c.Param("id")
	result := config.DB.Delete(&models.Room{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "客房不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetAllOrders(c *gin.Context) {
	var orders []models.Order
	if err := config.DB.Preload("Guests").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询订单失败"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	order.Status = input.Status
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, order)
}

func GetDashboardStats(c *gin.Context) {
	var hotelCount, userCount, orderCount, roomCount int64
	config.DB.Model(&models.Hotel{}).Count(&hotelCount)
	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Model(&models.Order{}).Count(&orderCount)
	config.DB.Model(&models.Room{}).Count(&roomCount)

	var totalRevenue float64
	config.DB.Model(&models.Order{}).Where("status != ?", "cancelled").Select("COALESCE(SUM(total_price), 0)").Scan(&totalRevenue)

	c.JSON(http.StatusOK, gin.H{
		"hotel_count":   hotelCount,
		"user_count":    userCount,
		"order_count":   orderCount,
		"room_count":    roomCount,
		"total_revenue": totalRevenue,
	})
}

func parseUint(s string) uint {
	n, _ := strconv.ParseUint(s, 10, 32)
	return uint(n)
}

package controllers

import (
	"hotel-system/config"
	"hotel-system/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateReview(c *gin.Context) {
	var input struct {
		HotelID uint   `json:"hotel_id"`
		UserID  uint   `json:"user_id"`
		Rating  int    `json:"rating"`
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	if input.Rating < 1 || input.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "评分必须在1-5之间"})
		return
	}

	var order models.Order
	err := config.DB.Where("user_id = ? AND hotel_id = ? AND status = ?", 
		input.UserID, input.HotelID, "checked_out").First(&order).Error
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "只能对已退房的订单进行评价"})
		return
	}

	var existingReview models.Review
	if err := config.DB.Where("hotel_id = ? AND user_id = ?", input.HotelID, input.UserID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "您已评价过该酒店"})
		return
	}

	review := models.Review{
		HotelID: input.HotelID,
		UserID:  input.UserID,
		Rating:  input.Rating,
		Content: input.Content,
	}

	if err := config.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "评价失败"})
		return
	}

	c.JSON(http.StatusOK, review)
}

func GetUserReviewedHotels(c *gin.Context) {
	userID := c.Param("user_id")
	var reviews []models.Review
	
	if err := config.DB.Where("user_id = ?", userID).Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取评价失败"})
		return
	}

	hotelIDs := make(map[uint]bool)
	for _, r := range reviews {
		hotelIDs[r.HotelID] = true
	}

	c.JSON(http.StatusOK, hotelIDs)
}

package controllers

import(
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"github.com/gin-gonic/gin"
)

func SearchHotels(c *gin.Context){
	city := c.Query("city")
	district := c.Query("district")
	minPrice := c.DefaultQuery("min_price", "0")
	maxPrice := c.DefaultQuery("max_price", "999999")

	var results []struct{
		models.Hotel
		Rooms []models.Room `gorm:"foreignKey:HotelID"`
	}

	query := config.DB.Preload("Rooms", "price Between ? and ?", minPrice, maxPrice).Model(&models.Hotel{})

	if city != ""{
		query = query.Where("city = ?", city)
	}
	if district != ""{
		query = query.Where("district = ?", district)
	}

	if err := query.Find(&results).Error; err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	c.JSON(http.StatusOK, results)
}

func GetHotelDetail(c *gin.Context){
	id := c.Param("id")
	
	var hotel models.Hotel
	if err := config.DB.First(&hotel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "酒店不存在"})
		return
	}

	var rooms []models.Room
	config.DB.Where("hotel_id = ?", id).Find(&rooms)

	var reviews []models.Review
	config.DB.Where("hotel_id = ?", id).Preload("User").Order("created_at desc").Limit(20).Find(&reviews)

	c.JSON(http.StatusOK, gin.H{
		"hotel": hotel,
		"rooms": rooms,
		"reviews": reviews,
	})
}
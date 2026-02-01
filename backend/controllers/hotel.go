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
	c.JSOn(http.StatusOK, results)
}
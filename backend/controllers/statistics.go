package controllers

import(
	"hotel-system/config"
	"net/http"
	"github.com/gin-gonic/gin"
)

func GetBookingStats(c *gin.Context){
	var results []map[string]interface{}

	query := `
		select h.city, h.district, h.name as hotel_name, count(o.order_id) as total_bookings
		from hotels h
		left join orders o on h.hotel_id = o.hotel_id
		group by h.city, h.district, h.name
	`

	if err := config.DB.Raw(query).Scan(&results).Error; err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "统计查询失败"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func GetGuestAnalysis(c *gin.Context){
	var analysis []map[string]interface{}

	query := `
		select occupation, education, count(*) as count
		from order_guests
		group by occupation, education
	`

	config.DB.Raw(query).Scan(&analysis)
	c.JSON(http.StatusOK, analysis)
}
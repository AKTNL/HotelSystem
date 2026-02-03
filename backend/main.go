package main

import(
	"hotel-system/config"
	"hotel-system/controllers"
	"github.com/gin-gonic/gin"
)

func main(){
	r := gin.Default()

	r.Use(func(c *gin.Context){
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS"{
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	config.ConnectDatabase()

	// 用户模块
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	// 酒店搜索
	r.GET("/hotels", controllers.SearchHotels)

	// 订单模块
	r.POST("/orders", controllers.CreateOrder)
	r.PUT("/orders/:id/cancel", controllers.CancelOrder)

	// 管理统计模块
	admin := r.Group("/admin")
	{
		admin.GET("/stats/bookings", controllers.GetBookingStats)
		admin.GET("/stats/guests", controllers.GetGuestAnalysis)
	}

	r.Run(":8080")
}
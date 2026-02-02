package main

import(
	"hotel-system/config"
	"hotel-system/controllers"
	"github.com/gin-gonic/gin"
)

func main(){
	r := gin.Default()
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
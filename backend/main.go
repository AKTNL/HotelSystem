package main

import (
	"hotel-system/config"
	"hotel-system/controllers"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	config.ConnectDatabase()

	// 初始化数据
	r.GET("/init", controllers.InitData)

	// 用户模块
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	r.GET("/user/:id", controllers.GetUserProfile)
	r.PUT("/user/:id", controllers.UpdateUserProfile)
	r.GET("/orders/user/:user_id", controllers.GetUserOrders)

	// 酒店搜索
	r.GET("/hotels", controllers.SearchHotels)
	r.GET("/hotels/:id", controllers.GetHotelDetail)

	r.POST("/reviews", controllers.CreateReview)
	r.GET("/reviews/user/:user_id", controllers.GetUserReviewedHotels)

	// 订单模块
	r.POST("/orders", controllers.CreateOrder)
	r.PUT("/orders/:id/cancel", controllers.CancelOrder)

	// 管理员模块
	admin := r.Group("/admin")
	{
		// 仪表盘
		admin.GET("/dashboard", controllers.GetDashboardStats)

		// 用户管理
		admin.GET("/users", controllers.GetAllUsers)
		admin.PUT("/users/:id", controllers.UpdateUser)
		admin.DELETE("/users/:id", controllers.DeleteUser)

		// 酒店管理
		admin.POST("/hotels", controllers.CreateHotel)
		admin.PUT("/hotels/:id", controllers.UpdateHotel)
		admin.DELETE("/hotels/:id", controllers.DeleteHotel)

		// 客房管理
		admin.GET("/rooms", controllers.GetAllRooms)
		admin.POST("/rooms", controllers.CreateRoom)
		admin.PUT("/rooms/:id", controllers.UpdateRoom)
		admin.DELETE("/rooms/:id", controllers.DeleteRoom)

		// 订单管理
		admin.GET("/orders", controllers.GetAllOrders)
		admin.PUT("/orders/:id/status", controllers.UpdateOrderStatus)

		// 统计
		admin.GET("/stats/bookings", controllers.GetBookingStats)
		admin.GET("/stats/guests", controllers.GetGuestAnalysis)
	}

	r.Run(":8080")
}

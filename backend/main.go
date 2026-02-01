package main

import(
	"hotel-system/config"
	"hotel-system/controllers"
	"github.com/gin-gonic/gin"
)

func main(){
	r := gin.Default()
	config.ConnectDatabase()

	r.POST("/register", controllers.Register)
	r.POST("/orders", controllers.CreateOrder)
	r.GET("/hotels", controllers.SearchHotels)
	r.PUT("/orders/:id/cancel", controllers.CancelOrder)

	admin := r.Group("/admin"){
		admin.GET("/stats/bookings", controllers.GetBookingStats)
		admin.GET("/stats/guests", controllers.GetGuestAnalysis)
	}

	r.Run(":8080")
}
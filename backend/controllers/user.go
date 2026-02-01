package controllers

import (
	"hotel-system/config"
	"hotel-system/models"
	"net/http"
	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context){
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"real_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "输入数据不合法"})
		return
	}

	user := models.User{
		Username:     input.Username,
		PasswordHash: input.Password,
		RealName:     input.RealName,
	}

	if err := config.DB.Create(&user).Error; err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败，用户名可能已存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "注册成功", "data": user})
}
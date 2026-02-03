package controllers

import (
	"hotel-system/config"
	"hotel-system/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"real_name" binding:"required"`
	}

	// 1. 验证输入格式
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "输入数据不合法"})
		return
	}

	//密码加密处理
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	// 2. 创建用户对象
	user := models.User{
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		RealName:     input.RealName,
	}

	// 3. 写入数据库
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败，用户名可能已存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "注册成功", "data": user})
}

// Login 用户登录逻辑
func Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入用户名和密码"})
		return
	}

	var user models.User
	// 1. 根据用户名查询用户
	if err := config.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	// 2. 校验密码
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	// 3. 返回用户信息
	c.JSON(http.StatusOK, gin.H{
		"message":  "登录成功",
		"user_id":  user.UserID,
		"is_vip":   user.IsVip,
		"username": user.Username,
	})
}

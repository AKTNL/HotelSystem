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
		Username string `json:"username"`
		Password string `json:"password"`
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := models.User{
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		RealName:     input.RealName,
		Phone:        input.Phone,
		Email:        input.Email,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func Login(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetUserProfile(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateUserProfile(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	var input struct {
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		IDCard   string `json:"id_card"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	if input.RealName != "" {
		user.RealName = input.RealName
	}
	if input.Phone != "" {
		user.Phone = input.Phone
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.IDCard != "" {
		if len(input.IDCard) != 18 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "身份证号必须为18位"})
			return
		}
		user.IDCard = input.IDCard
		user.IsVerified = true
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, user)
}

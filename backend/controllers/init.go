package controllers

import (
	"hotel-system/config"
	"hotel-system/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func InitData(c *gin.Context) {
	hotels := []models.Hotel{
		{Name: "北京王府井希尔顿酒店", City: "北京", District: "东城区", Address: "王府井大街57号"},
		{Name: "北京国贸大酒店", City: "北京", District: "朝阳区", Address: "建国门外大街1号"},
		{Name: "北京中关村皇冠假日酒店", City: "北京", District: "海淀区", Address: "中关村南大街31号"},
		{Name: "上海外滩华尔道夫酒店", City: "上海", District: "黄浦区", Address: "中山东一路2号"},
		{Name: "上海浦东香格里拉大酒店", City: "上海", District: "浦东新区", Address: "富城路33号"},
		{Name: "上海静安香格里拉酒店", City: "上海", District: "静安区", Address: "延安中路1218号"},
		{Name: "广州天河希尔顿酒店", City: "广州", District: "天河区", Address: "林和中路8号"},
		{Name: "广州白天鹅宾馆", City: "广州", District: "荔湾区", Address: "沙面南街1号"},
		{Name: "深圳华侨城洲际大酒店", City: "深圳", District: "南山区", Address: "华侨城深南大道9009号"},
		{Name: "深圳福田香格里拉酒店", City: "深圳", District: "福田区", Address: "益田路4088号"},
		{Name: "杭州西湖国宾馆", City: "杭州", District: "西湖区", Address: "杨公堤18号"},
		{Name: "杭州西溪悦榕庄", City: "杭州", District: "西湖区", Address: "西溪湿地国家公园内"},
		{Name: "成都香格里拉大酒店", City: "成都", District: "锦江区", Address: "滨江东路9号"},
		{Name: "成都博舍酒店", City: "成都", District: "锦江区", Address: "笔帖式街81号"},
		{Name: "西安威斯汀大酒店", City: "西安", District: "雁塔区", Address: "曲江新区慈恩路666号"},
		{Name: "西安皇冠假日酒店", City: "西安", District: "碑林区", Address: "长安北路75号"},
		{Name: "南京金陵饭店", City: "南京", District: "鼓楼区", Address: "汉中路2号"},
		{Name: "南京香格里拉大酒店", City: "南京", District: "鼓楼区", Address: "中央路329号"},
	}

	rooms := []struct {
		HotelIndex         int
		RoomType           string
		Price              float64
		Capacity           int
		TotalInventory     int
		AvailableInventory int
	}{
		{0, "标准间", 688, 2, 50, 45},
		{0, "豪华间", 988, 2, 30, 28},
		{0, "套房", 1688, 3, 10, 8},
		{1, "标准间", 788, 2, 80, 72},
		{1, "商务间", 1088, 2, 40, 35},
		{1, "行政套房", 2288, 3, 15, 12},
		{2, "标准间", 588, 2, 60, 55},
		{2, "豪华间", 888, 2, 35, 30},
		{3, "江景房", 1288, 2, 40, 35},
		{3, "豪华江景房", 1888, 2, 25, 20},
		{3, "总统套房", 8888, 4, 5, 4},
		{4, "标准间", 988, 2, 100, 88},
		{4, "豪华间", 1388, 2, 60, 52},
		{4, "行政套房", 2688, 3, 20, 18},
		{5, "标准间", 888, 2, 70, 65},
		{5, "豪华间", 1288, 2, 40, 35},
		{6, "标准间", 688, 2, 55, 50},
		{6, "豪华间", 988, 2, 30, 28},
		{7, "江景房", 888, 2, 45, 40},
		{7, "豪华江景房", 1288, 2, 25, 22},
		{8, "标准间", 788, 2, 65, 58},
		{8, "豪华间", 1188, 2, 35, 30},
		{8, "套房", 1988, 3, 12, 10},
		{9, "标准间", 888, 2, 90, 82},
		{9, "商务间", 1288, 2, 50, 45},
		{10, "湖景房", 1088, 2, 30, 25},
		{10, "豪华湖景房", 1688, 2, 20, 18},
		{11, "园景房", 1388, 2, 25, 22},
		{11, "水景房", 1888, 2, 15, 12},
		{12, "标准间", 688, 2, 70, 62},
		{12, "豪华间", 988, 2, 40, 35},
		{12, "套房", 1688, 3, 15, 12},
		{13, "标准间", 888, 2, 50, 45},
		{13, "豪华间", 1288, 2, 30, 28},
		{14, "标准间", 688, 2, 60, 55},
		{14, "豪华间", 988, 2, 35, 30},
		{15, "标准间", 588, 2, 55, 50},
		{15, "商务间", 888, 2, 30, 28},
		{16, "标准间", 588, 2, 80, 72},
		{16, "豪华间", 888, 2, 45, 40},
		{16, "套房", 1488, 3, 15, 12},
		{17, "标准间", 688, 2, 65, 58},
		{17, "豪华间", 988, 2, 35, 32},
	}

	users := []models.User{
		{Username: "testuser", PasswordHash: "123456", RealName: "测试用户", Points: 100, IsVip: false},
		{Username: "vipuser", PasswordHash: "123456", RealName: "VIP用户", Points: 1000, IsVip: true},
	}

	var existingCount int64
	config.DB.Model(&models.Hotel{}).Count(&existingCount)
	if existingCount > 0 {
		c.JSON(http.StatusOK, gin.H{"message": "数据已存在，跳过初始化", "hotel_count": existingCount})
		return
	}

	for i := range hotels {
		if err := config.DB.Create(&hotels[i]).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建酒店失败"})
			return
		}
	}

	for _, r := range rooms {
		room := models.Room{
			HotelID:            hotels[r.HotelIndex].HotelID,
			RoomType:           r.RoomType,
			Price:              r.Price,
			Capacity:           r.Capacity,
			TotalInventory:     r.TotalInventory,
			AvailableInventory: r.AvailableInventory,
		}
		if err := config.DB.Create(&room).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建客房失败"})
			return
		}
	}

	for i := range users {
		if err := config.DB.Create(&users[i]).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户失败"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "初始化成功",
		"hotel_count": len(hotels),
		"room_count":  len(rooms),
		"user_count":  len(users),
	})
}

package middlewares

import (
	"github.com/CaviarChen/CCC_Project_2/go_backend/config"
	"github.com/gin-gonic/gin"
)

func MessageQueueAuth(c *gin.Context) {
	if c.Query("token") != config.GetToken() {
		c.String(403, "forbidden")
		c.Abort()
	} else {
		c.Next()
	}
}

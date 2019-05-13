package server

import (
	"github.com/CaviarChen/CCC_Project_2/go_backend/controllers"
	"github.com/CaviarChen/CCC_Project_2/go_backend/middlewares"
	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

	r.GET("/helper/get_annotated_image", controllers.GetAnnotatedImage)

	mq := r.Group("/message_queue")
	mq.Use(middlewares.MessageQueueAuth)
	{
		mq.GET("/get_import_job", controllers.GetImportJob)
		mq.GET("/get_preprocess_job", controllers.GetPreprocessJob)
		mq.GET("/get_harvest_user_job", controllers.GetHarvestUserJob)
	}

	return r
}

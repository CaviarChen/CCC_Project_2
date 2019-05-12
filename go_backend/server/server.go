package server

import (
	"log"

	"github.com/CaviarChen/CCC_Project_2/go_backend/config"
	"github.com/CaviarChen/CCC_Project_2/go_backend/controllers"
)

func Init() {
	config.Init()
	controllers.Init()

	r := setupRouter()
	err := r.Run("0.0.0.0:8888")
	if err != nil {
		log.Fatal(err)
	}
}

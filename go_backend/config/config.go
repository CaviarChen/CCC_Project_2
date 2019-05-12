package config

import (
	"net/url"
	"os"
)

var couchDBUrl string
var token string

func Init() {
	host := os.Getenv("H_DB_HOST")
	user := os.Getenv("H_DB_USER")
	token = os.Getenv("H_DB_TOKEN")
	u, err := url.Parse(host)
	if err != nil {
		panic(err)
	}
	u.User = url.UserPassword(user, token)
	couchDBUrl = u.String()
}

func GetCouchDBUrl() string {
	return couchDBUrl
}

func GetToken() string {
	return token
}

package controllers

import (
	"fmt"
	"log"
	"time"

	"github.com/CaviarChen/CCC_Project_2/go_backend/config"
	"github.com/leesper/couchdb-golang"

	"github.com/gin-gonic/gin"
)

const (
	loadSize = 40
	// 8 hour
	importJobTimeout = 8 * 60 * 60
	// 10 hour
	userHarvestJobInterval = 10 * 60 * 60
	// 2 hour
	preprocessJobTimeout = 2 * 60 * 60

	// 20 mins
	noJobWait = 20 * 60
)

func Init() {
	go fetchJobsToChannel("import_job", `finished == false && lock_timestamp <= %d`, chanImportJobs, importJobTimeout)
	go fetchJobsToChannel("harvest_twitter_user", `last_harvest <= %d`, chanHarvestUserJobs, userHarvestJobInterval)
	query := `process_meta.processed == false && process_meta.lock_timestamp <= %d`
	go fetchJobsToChannel("harvest_twitter_tweet", query, chanPreprocessJobsFromHarvestDb, preprocessJobTimeout)
	go fetchJobsToChannel("import_twitter_tweet", query, chanPreprocessJobsFromImportDb, preprocessJobTimeout)
}

// uses buffered channel to limit the things loaded into go_backend
var chanImportJobs = make(chan string, 1)
var chanHarvestUserJobs = make(chan string, 1)
var chanPreprocessJobsFromImportDb = make(chan string, 1)
var chanPreprocessJobsFromHarvestDb = make(chan string, 1)

func fetchJobsToChannel(dbname string, queryString string, channel chan string, lockTimeout int64) {
	log.Print("start fecthing db: " + dbname + "\n")
	// connect to db
	server, err := couchdb.NewServer(config.GetCouchDBUrl())
	if err != nil {
		log.Fatal(err)
	}
	db, err := server.Get(dbname)
	if err != nil {
		log.Fatal(err)
	}

	// loop and add to queue
	for {
		time.Sleep(1000 * time.Millisecond)

		// load one batch
		s := fmt.Sprintf(queryString, time.Now().Unix()-lockTimeout)
		resList, err := db.Query([]string{"_id"}, s, nil, loadSize, nil, nil)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("fetch a betch from db: %s, got: %d \n", dbname, len(resList))

		// adding to channel
		// blocking if too many
		for _, res := range resList {
			channel <- res["_id"].(string)
		}

		if len(resList) < loadSize {
			log.Print(dbname + " no job wait\n")
			time.Sleep(noJobWait * 1000 * time.Millisecond)
		}

	}
}

func GetImportJob(c *gin.Context) {
	var jobID string
	select {
	case res := <-chanImportJobs:
		jobID = res
	case <-time.After(30 * time.Second):
	}

	if jobID == "" {
		c.JSON(404, gin.H{"jobID": ""})
	} else {
		c.JSON(200, gin.H{"jobID": jobID})
	}
}

func GetHarvestUserJob(c *gin.Context) {
	var jobID string
	select {
	case res := <-chanHarvestUserJobs:
		jobID = res
	case <-time.After(30 * time.Second):
	}

	if jobID == "" {
		c.JSON(404, gin.H{"jobID": ""})
	} else {
		c.JSON(200, gin.H{"jobID": jobID})
	}
}

func GetPreprocessJob(c *gin.Context) {
	var jobID string
	var dbType string
	select {
	case res := <-chanPreprocessJobsFromImportDb:
		jobID = res
		dbType = "import_twitter_tweet"
	case res := <-chanPreprocessJobsFromHarvestDb:
		jobID = res
		dbType = "harvest_twitter_tweet"
	case <-time.After(30 * time.Second):
	}

	if jobID == "" {
		c.JSON(404, gin.H{"jobID": "", "dbType": ""})
	} else {
		c.JSON(200, gin.H{"jobID": jobID, "dbType": dbType})
	}
}

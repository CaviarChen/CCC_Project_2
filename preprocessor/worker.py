from datetime import datetime
from db_helper import DBHelper
import cloudant
import time
import const
import surburbHandler
import textAnalysis
import traceback
import random

class Worker:
    def __init__(self, worker_id: int) -> None:
        self.worker_id = worker_id
        self.db = DBHelper()
    
    def run(self) -> None:
        self.log("start")

        while True:
            
            try:
                self.handle_one()
            except Exception as e:
                self.log("unknown error: ", e)
            
            time.sleep(0.2)


    def handle_one(self) -> None:
        # get job
        tweet_type = "harvest_twitter_tweet"
        job_id = self.db.get_process_job(tweet_type)
        if job_id is None:
            tweet_type = "import_twitter_tweet"
            job_id = self.db.get_process_job(tweet_type)
            if job_id is None:
                print("no job, wait")
                time.sleep(const.NO_JOB_WAIT)
                return

        # lock job
        try:
            job_doc = self.db.lock_process_job(tweet_type, job_id)
        except Exception as e:
            self.log("unable to lock, skip: ", job_id, e)
            # random backoff time
            time.sleep(0.01* random.randint(1, 40))
            return
        
        try:
            self.process_one(tweet_type, job_doc)
        except Exception as e:
            self.log("error during processing: ", job_id, e)
            return
        
        # mark as finished
        try:
            self.db.mark_as_finished(job_doc)
            self.log("job finished: ", job_id)
        except Exception as e:
            self.log("unable to finish a job: ", job_id, e)


    def process_one(self, tweet_type: str, job_doc: cloudant.document) -> None:
        data = {}

        # process image
        import image_handler
        images = image_handler.handle_tweet_media(job_doc["raw"], self, self.db)

        if images is None:
            raise Exception("error happened during handle_tweet_media")
        (surburb, longtitude, latitude) = surburbHandler.handle_raw(job_doc["raw"])
        data["images"] = images

        # cmj -----------------------------------------------------------------
        data["geo"] = {"surburb": surburb,
                        "longtitude": longtitude,
                        "latitude": latitude}
        hashtags = []
        try:
            doc_hashtags = job_doc["raw"]["entities"]["hashtags"]
            for dh in doc_hashtags:
                hashtags.append(dh["text"])
            text = job_doc["raw"]["text"]
            time = job_doc["raw"]["created_at"]
            user_id = job_doc["raw"]["user"]["id_str"]
            user_name = job_doc["raw"]["user"]["screen_name"]
        except Exception as e:
            self.log("no such field in the twitter document:", e)

        data["hashtags"] = hashtags
        data["text"] = text
        data["created_at"] = time
        data["user"] = {"id": user_id,
                        "name": user_name}
        keyWords = textAnalysis.glutonnyWords(text, hashtags)
        data["words_of_interest"] = keyWords


        self.db.submit_result(tweet_type, job_doc, data)

    
    def log(self, *args) -> None:
        t = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print ("[" + t + "] [" + str(self.worker_id) + "]", *args)

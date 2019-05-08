import cloudant
import tweepy
from maintask import MainTask
import const
import time
from db_helper import DBHelper


def harvest_user_tweets(maintask: MainTask, auth: tweepy.OAuthHandler) -> None:
    db = maintask.get_db_helper()
    api = tweepy.API(auth)
    while maintask.active:
        # start wokring
        _id = db.get_user_harvest_job()
        if _id is None:
            # no more jobs, wait a while
            maintask.log("user tweets: nojob")
            maintask.sleep(const.USER_NO_JOB_SLEEP_TIME)
            continue
        
        try:    
            doc = db.lock_user_harvest_job(_id)
        except Exception as e:
            # someone else taken this job, go to next one
            maintask.log("user tweets: unable to lock", _id, e)
            continue
        
        maintask.log("user tweets: job got ", _id)

        try:
            if not harvest_single_user(maintask, api, doc, db):
                # twitter api problem
                maintask.sleep(const.USER_TWITTER_API_BACKOFF)
        except Exception as e:
            maintask.log("user tweets: unknown error", e)
            # don't realse lock when there is an error,
            # just wait for timeout
        
        # take a rest
        maintask.sleep(10)



def harvest_single_user(maintask: MainTask, api: tweepy.API, doc: cloudant.document, db: DBHelper) -> bool:
    max_id = 0
    min_id_last_round = None
    counter = 0
    while True:
        kwargs = {
            "user_id": doc["_id"],
            "since_id": int(doc["last_harvest_tweet_id"]) + 1,
            "include_rts": "false"
        }
        if min_id_last_round is not None:
            kwargs["max_id"] = str(min_id_last_round - 1)

        try:
            status_list = api.user_timeline(**kwargs)
        except Exception as e:
            maintask.log("user tweets: twitter api error, backoff", e)
            return False
        
        ids = []
        if len(status_list) == 0:
            break
        
        for status in status_list:
            counter += 1
            t_json = status._json
            t_id = int(t_json["id_str"])
            max_id = max(max_id, t_id)
            ids.append(t_id)
            db.add_tweet(t_json)
            
        min_id_last_round = min(ids)

        maintask.log("user tweets: ids from ", min(ids), "to", max(ids))

    
    doc["last_harvest_tweet_id"] = str(max(max_id, int(doc["last_harvest_tweet_id"])))
    doc["last_harvest"] = int(time.time())
    doc.save()

    maintask.log("user tweets: got tweets", counter)
    
    return True



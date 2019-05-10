import time
from datetime import date, timedelta
from db_helper import DBHelper
import config


def harvest_twitter_tweet_process_meta_update() -> None:
    db = DBHelper()
    count = 0
    for doc in db.client["harvest_twitter_tweet"]:
        if "locked" in doc["process_meta"]:
            # old version
            doc["process_meta"] = {
                'lock_timestamp': 0,
                'processed': False
            }
            doc.save()

            count += 1

            if count % 100 == 0:
                print(count)
    
    print("finished.", count)

    
    
        


if __name__ == "__main__":
    harvest_twitter_tweet_process_meta_update()

import time
import pytz
from datetime import timezone
from datetime import datetime
from datetime import date, timedelta
from db_helper import DBHelper
import config
import tqdm


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

def tweet_data_melb_time_update() -> None:
    db = DBHelper()
    count = 0
    
    for doc in tqdm.tqdm(db.client["tweet_data"], total=db.client["tweet_data"].doc_count()):
        if "created_at_melb_time" not in doc["data"]:
            # old version

            time = doc["data"]["created_at"]
            melb_time = datetime.strptime(time, '%a %b %d %H:%M:%S %z %Y')\
                .replace(tzinfo=timezone.utc).astimezone(pytz.timezone('Australia/Melbourne'))

            doc["data"]["created_at_melb_time"] = \
                [melb_time.year, melb_time.month, melb_time.day, melb_time.hour, melb_time.minute, melb_time.second]
            doc.save()

            count += 1

            if count % 100 == 0:
                print(count)
    
    print("finished.", count)


    
    
        


if __name__ == "__main__":
    # harvest_twitter_tweet_process_meta_update()
    tweet_data_melb_time_update()

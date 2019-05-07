import cloudant
from cloudant.client import CouchDB
import time
from typing import *

import const

import config

class DBHelper:
    def __init__(self) -> None:
        self.client = CouchDB(config.couchdb_user, config.couchdb_auth_token, \
            url=config.couchdb_host, admin_party=config.couchdb_admin_party, connect=True)
        self.node_id = config.node_id
    
    # add if not exists
    def add_user(self, user_id: str, screen_name: str) -> None:
        harvest_meta = {
            'timestamp': int(time.time()),
            'node_id': self.node_id
        }
        data = {
            '_id': user_id,
            'screen_name': screen_name,
            'last_harvest': 0,
            'last_harvest_tweet_id': const.TWEET_ID_CUT_OFF,
            'harvest_meta': harvest_meta
        }
        self.client["harvest_twitter_user"].create_document(data, False)
    
    # add if not exists
    def add_tweet(self, tweet_json: Dict[str, Any]) -> None:
        
        if not self.keep_tweet_json(tweet_json):
            return

        harvest_meta = {
            'timestamp': int(time.time()),
            'node_id': self.node_id
        }
        process_meta = {
            'locked': False,
            'process_start_time': 0,
            'processed': False
        }
        data = {
            '_id': tweet_json["id_str"],
            'raw': tweet_json,
            'process_meta': process_meta,
            'harvest_meta': harvest_meta
        }
        self.client["harvest_twitter_tweet"].create_document(data, False)

    # find one user that haven't been harvested in X hours
    def get_user_harvest_job(self) -> Optional[str]:
        # TODO: index?

        selector = {
            'last_harvest': {
                '$lt': int(time.time()) - const.USER_HARVEST_INTERVAL
                }
            }
        query = cloudant.query.Query(self.client["harvest_twitter_user"], \
            selector=selector, fields=['_id'])
        if len(query(limit=1)["docs"]) == 0:
            # no more jobs
            return None
        return query(limit=1)["docs"][0]["_id"]
    
    def lock_user_harvest_job(self, id: str) -> cloudant.document:
        # try to lock this job
        doc = self.client["harvest_twitter_user"][id]

        deadline = int(time.time()) - const.USER_HARVEST_INTERVAL
        if doc["last_harvest"] > deadline:
            raise Exception("job been taken due to change of last_harvest")
        doc["last_harvest"] = deadline + const.USER_HARVEST_TIMEOUT
        doc.save()

        return doc

    def keep_tweet_json(self, tweet_json):
        if config.tweet_geo_limit is None:
            return True
        try:
            coorlist = tweet_json["coordinates"]["coordinates"]
            if len(coorlist) == 2:
                longtitude = coorlist[0]
                latitude = coorlist[1]
                if (config.tweet_geo_limit[0] < longtitude < config.tweet_geo_limit[1]):
                    if (config.tweet_geo_limit[2] < latitude < config.tweet_geo_limit[3]):
                        return True
        except Exception:
            pass

        return False



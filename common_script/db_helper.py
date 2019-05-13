import cloudant
from cloudant.client import CouchDB
import time
from typing import *

import const

import config

class DBHelper:
    def __init__(self) -> None:
        self.client = CouchDB(config.couchdb_user, config.couchdb_auth_token, \
            url=config.couchdb_host, admin_party=config.couchdb_admin_party, connect=True, auto_renew=True)
        self.node_id = config.node_id
    
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




import cloudant
from cloudant.client import CouchDB
import time
from typing import *

import const
import random
import requests

import config

class DBHelper:
    def __init__(self) -> None:
        self.client = CouchDB(config.couchdb_user, config.couchdb_auth_token, \
            url=config.couchdb_host, admin_party=config.couchdb_admin_party, connect=True, auto_renew=True)
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
            'lock_timestamp': 0,
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
        r = requests.get(config.couchdb_host + "/go_backend/message_queue/get_harvest_user_job", {"token": config.couchdb_auth_token})
        if r.status_code == 200:
            j = r.json()
            return j["jobID"]
        if r.status_code == 404:
            # no more job
            return None
        raise Exception("Unable to get a job", r.status_code, r.text)
    
    def lock_user_harvest_job(self, id: str) -> cloudant.document:
        # try to lock this job
        doc = self.client["harvest_twitter_user"][id]
        doc.fetch()

        deadline = int(time.time()) - const.USER_HARVEST_INTERVAL
        if doc["last_harvest"] > deadline:
            raise Exception("job has been taken due to change of last_harvest, {}, {}".format(doc["last_harvest"], deadline))
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




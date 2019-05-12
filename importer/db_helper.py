import cloudant
from cloudant.client import CouchDB
import time
from typing import *
import random
import const
import requests

import config

class DBHelper:
    def __init__(self) -> None:
        self.client = CouchDB(config.couchdb_user, config.couchdb_auth_token, \
            url=config.couchdb_host, admin_party=config.couchdb_admin_party, connect=True)
        self.node_id = config.node_id
    
    # add if not exists
    def add_tweet_import(self, tweet_json: Dict[str, Any]) -> bool:
        
        if not self.keep_tweet_json(tweet_json):
            return False

        import_meta = {
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
            'import_meta': import_meta
        }
        self.client["import_twitter_tweet"].create_document(data, False)
        return True

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

    def get_import_job(self) -> Optional[str]:
        r = requests.get(config.couchdb_host + "/go_backend/message_queue/get_import_job", {"token": config.couchdb_auth_token})
        if r.status_code == 200:
            j = r.json()
            return j["jobID"]
        if r.status_code == 404:
            # no more job
            return None
        raise Exception("Unable to get a job", r.status_code, r.text)


    def lock_import_job(self, id: str) -> cloudant.document:
        # try to lock this job
        doc = self.client["import_job"][id]
        # ignore local cache
        doc.fetch()

        deadline = int(time.time()) - const.IMPORT_JOB_TIMEOUT
        if doc["lock_timestamp"] > deadline or doc["finished"] == True:
            raise Exception("job been taken due to change of last_harvest")

        doc["lock_timestamp"] = int(time.time())
        doc["work_node"] = config.node_id
        doc.save()

        return doc


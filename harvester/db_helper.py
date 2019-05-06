from cloudant.client import CouchDB
import time
from typing import *

from const import TWEET_ID_CUT_OFF

class DBHelper:
    def __init__(self, couchdb_host: str, node_id: str) -> None:
        self.client = CouchDB(None, None, url=couchdb_host, admin_party=True, connect=True)
        self.node_id = node_id
    
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
            'locked': False,
            'last_harvest_tweet_id': TWEET_ID_CUT_OFF,
            'harvest_meta': harvest_meta
        }
        self.client["harvest_twitter_user"].create_document(data, False)
    
    # add if not exists
    def add_tweet(self, tweet_json: Dict[str, Any]) -> None:
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


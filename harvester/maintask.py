import tweepy
from cloudant.client import CouchDB
import uuid
from datetime import datetime
import threading
import cloudant
from db_helper import DBHelper

import time


# CouchDB is not only our storage, but also our distributed lock and message queue for this harvester
# It's fine since we don't need this to be strong consistant 
# and a small part of jobs are allowed to be done twice in rare cases

# Python threading is used since this program is not CPU heavy
class MainTask:
    def __init__(self, couchdb_host: str, node_id: str) -> None:
        self.active = True
        self.couchdb_host = couchdb_host
        self.node_id = node_id

        db = self.get_db_helper()
        # eaxc_id is generated per execution
        self.exec_id = str(uuid.uuid1())
        print("exec_id:", self.exec_id)

        # retrieve the config and "lock" it
        while True:
            doc_config = db.client["config"][":".join(["harvester", node_id])]

            # no activity in resent 5 mins
            if "last_active" not in doc_config or time.time() - doc_config["last_active"] > 5*60:
                doc_config["last_active"] = int(time.time())
                doc_config["last_exec_id"] = self.exec_id
                doc_config.save()
                break
            
            self.log("be used by others, backoff")
            self.sleep(2*60)

        # twitter auth
        auth = tweepy.OAuthHandler(doc_config["twitter"]["consumer_key"], doc_config["twitter"]["consumer_secret"])
        auth.set_access_token(doc_config["twitter"]["access_token"], doc_config["twitter"]["access_token_secret"])

        # test
        from twitter_stream import listen_stream
        listen_stream(self, auth)


        self.doc_config = doc_config

        self.thread_config_lock = threading.Thread(target=self._config_lock)
        self.thread_config_lock.start()
    
    def get_db_helper(self) -> CouchDB:
        return DBHelper(self.couchdb_host, self.node_id)

    
    def abort(self):
        if not self.active:
            return

        # try to relase lock
        try:
            self.doc_config["last_active"] = 0
            self.doc_config.save()
            self.log("lock freed")
        except Exception:
            pass
        
        self.log("abort")
        self.active = False

    def log(self, *args):
        print("[" + self.exec_id + "]", *args)

    def wait(self):
        if self.thread_config_lock is not None and self.thread_config_lock.is_alive:
            self.thread_config_lock.join()

    def _config_lock(self):
        try:
            while self.active:
                if not self.sleep(1*60):
                    break
                self.doc_config["last_active"] = int(time.time())
                self.doc_config.save()
                self.log("config_lock heartbeat")
        except Exception as e:
            self.log("config_lock config changed or someone else took over", e)
            self.abort()
    
    def sleep(self, sec: int) -> bool:
        while (self.active and sec > 0):
            time.sleep(2)
            sec -= 2
        return self.active

import tweepy
from tweepy import Stream
from tweepy.streaming import StreamListener
from cloudant.client import CouchDB
import uuid
from datetime import datetime
import threading
import cloudant

import time


# CouchDB is not only our storage, but also our distributed lock and message queue for this harvester
# It's fine since we don't need this to be strong consistant 
# and a small part of jobs are allowed to be done twice in rare cases

# Python threading is used since this program is not CPU heavy
class MainTask:
    def __init__(self, couchdb_host: str, node_id: str):
        self.client = CouchDB(None, None, url=couchdb_host, admin_party=True, connect=True)

        # eaxc_id is generated per execution
        self.exec_id = str(uuid.uuid1())
        print("exec_id:", self.exec_id)

        # retrieve the config and "lock" it
        while True:
            doc_config = self.client["config"][":".join(["harvester", node_id])]

            # no activity in resent 5 mins
            if "last_active" not in doc_config or time.time() - doc_config["last_active"] > 5*60:
                doc_config["last_active"] = int(time.time())
                doc_config["last_exec_id"] = self.exec_id
                doc_config.save()
                break
            
            self.log("be used by others, backoff")
            time.sleep(2*60)

        
        self.doc_config = doc_config
        self.active = True

        self.thread_config_lock = threading.Thread(target=self._config_lock)
        self.thread_config_lock.start()

    
    def abort(self):
        if not self.active:
            return
        
        self.log("abort")
        self.active = False

    def _config_lock(self):
        try:
            while self.active:
                time.sleep(1*60)
                self.doc_config["last_active"] = int(time.time())
                self.doc_config.save()
                self.log("config_lock heartbeat")
        except Exception as e:
            self.log("config_lock config changed or someone else took over", e)
            self.abort()


    def log(self, *args):
        print("[" + self.exec_id + "]", *args)

    def wait(self):
        self.thread_config_lock.join()





def main() -> None:
    mainTask = MainTask("http://127.0.0.1:5984", "00")
    mainTask.wait()


if __name__ == "__main__":
    main()

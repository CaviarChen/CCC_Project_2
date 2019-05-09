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
    

    def get_process_job(self, db_name: str) -> Optional[str]:
        # TODO: index?

        selector = {
            'process_meta.processed': {
                '$eq': False
            },
            'process_meta.lock_timestamp': {
                '$lt': int(time.time()) - const.PROCESS_JOB_TIMEOUT
                }
            }
        query = cloudant.query.Query(self.client[db_name], \
            selector=selector, fields=['_id'])
        if len(query(limit=1)["docs"]) == 0:
            # no more jobs
            return None
        return query(limit=1)["docs"][0]["_id"]


    def lock_process_job(self, db_name: str, id: str) -> cloudant.document:
        # try to lock this job
        doc = self.client[db_name][id]

        deadline = int(time.time()) - const.PROCESS_JOB_TIMEOUT
        if doc["process_meta"]["lock_timestamp"] > deadline or doc["process_meta"]["processed"] == True:
            raise Exception("job have been taken.")

        doc["process_meta"]["lock_timestamp"] = int(time.time())
        doc["process_meta"]["work_node"] = config.node_id
        doc.save()

        return doc
    
    def mark_as_finished(self, doc: cloudant.document) -> None:
        doc["process_meta"]["processed"] = True
        doc.save()


    def submit_result(self, db_name: str, job_doc: cloudant.document, data: Dict[str, Any]) -> None:
        process_meta = {
            'source': db_name,
            'finished_time': int(time.time()),
            'work_node': config.node_id
        }
        result_doc = {
            '_id': job_doc["_id"],
            'data': data,
            'process_meta': process_meta
        }
        self.client["tweet_data"].create_document(result_doc, True)

    def get_tweet_image_with_yolo(self, url: str) -> Optional[Any]:
        if url in self.client["tweet_image_with_yolo"]:
            doc = self.client["tweet_image_with_yolo"][url]

            return {
                "url": doc["_id"],
                "yolo": doc["yolo"]
            }
        else:
            return None


    def add_tweet_image_with_yolo(self, url: str, yolo: Any, file_content: Any, tweet_id: str) -> None:
        doc = {
            '_id': url,
            'yolo': yolo,
            'work_node': config.node_id,
            'time': int(time.time()),
            'tweet_id': tweet_id
        }
        doc = self.client["tweet_image_with_yolo"].create_document(doc, True)
        doc.put_attachment("small.jpg", "image/jpeg", file_content)

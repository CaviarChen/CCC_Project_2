from typing import *
from worker import Worker
import requests
import tempfile
import time
import pathlib
from darknetpy.detector import Detector
import threading
from db_helper import DBHelper

TMP_FOLDER = "./tmp"
detector = None
lock = None

def init() -> None:
    global detector
    global lock
    pathlib.Path(TMP_FOLDER).mkdir(parents=True, exist_ok=True) 
    detector = Detector('./darknet/coco.data',
                    './darknet/yolov3_320.cfg',
                    './darknet/yolov3.weights')
    lock = threading.Lock()
    

#  None = failed
def handle_tweet_media(tweet_json: Dict[str, Any], worker: Worker, db: DBHelper) -> Optional[List[Dict[str, Any]]]:
    try:
        res = []
        if "extended_entities" not in tweet_json or "media" not in tweet_json["extended_entities"]:
            return []
        media = tweet_json["extended_entities"]["media"]
        for img in media:
            try:
                img_url: str = img["media_url_https"]
                if img_url.startswith("https://pbs.twimg.com/") and img_url.endswith(".jpg"):
                    worker.log("handle_tweet_media: image", img_url)

                    tmp = db.get_tweet_image_with_yolo(img_url)
                    if tmp is not None:
                        res.append(tmp)
                        continue

                    # handle image
                    try:
                        yolo_res = process_a_image(img_url, db, tweet_json["id_str"])
                        res.append({
                            "url": img_url,
                            "yolo": yolo_res
                        })
                    except Exception as e:
                        worker.log("handle_tweet_media: process a image error", e)
                        return None


            except Exception as e:
                worker.log("handle_tweet_media: single media error", e)
    except Exception as e:
        worker.log("handle_tweet_media: unknown error", e)
        return []

    return res


def process_a_image(url: str, db: DBHelper, tweet_id: str) -> Dict[str, Any]:
    with tempfile.NamedTemporaryFile(dir=TMP_FOLDER, delete=True, suffix=".jpg") as tmpf:
        res = requests.get(url + ":small")
        if res.status_code != 200:
            raise Exception("unable to donwload image")

        content = res.content
        tmpf.write(content)
        tmpf.flush()
        # run yolo
        lock.acquire()
        try:
            results = detector.detect(tmpf.name)
        finally:
            lock.release()

    db.add_tweet_image_with_yolo(url, results, content, tweet_id)
        
    return results


import tweepy
from tweepy import Stream
from tweepy.streaming import StreamListener
from maintask import MainTask
import queue
from typing import *
from db_helper import DBHelper
import json


from const import STREAM_MAX_DB_ERROR_BEFORE_ABORT


class MyStreamListener(StreamListener):

    def __init__(self, maintask: MainTask, q: queue.Queue) -> None:
        self._maintask = maintask
        self._q = q
        super().__init__()

    def on_data(self, raw_data: str) -> bool:
        if not self._maintask.active:
            return False
        super().on_data(raw_data)
    
    def on_status(self, status) -> None:
        self._q.put(status._json)

    def on_error(self, status_code: int) -> bool:
        if status_code == 420:
            #returning False in on_error disconnects the stream
            return False
        # returning non-False reconnects the stream, with backoff.
        # sample wait, placeholder
        return True
    
    def on_disconnect(self, notice: Any) -> bool:
        self._maintask.log("twitter_stream disconnecting")
        self._maintask.abort()
        return False


def listen_stream(maintask: MainTask, auth: tweepy.OAuthHandler, locations: List[float]) -> None:
    q = queue.Queue()
    listener = MyStreamListener(maintask, q)
    
    twitter_stream = Stream(auth, listener)
    twitter_stream.filter(locations=locations, is_async=True)

    error_count = 0

    db = maintask.get_db_helper()
    # handling queue
    while True:
        try:
            t_json = q.get()
        except queue.Empty:
            if not maintask.active:
                break
            else:
                maintask.sleep(2)
        
        maintask.log("stream: got one: ", t_json["id_str"])
        try:
            _handle_one_tweet(db, t_json)
        except Exception as e:
            maintask.log("stream queue error:", e)
            error_count += 1
            if error_count > STREAM_MAX_DB_ERROR_BEFORE_ABORT:
                maintask.abort()
                break
        
        

def _handle_one_tweet(db: DBHelper, t_json: Dict[str, Any]):
    db.add_tweet(t_json)
    db.add_user(t_json["user"]["id_str"], t_json["user"]["screen_name"])
        

        




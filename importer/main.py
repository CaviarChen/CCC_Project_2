import time
import os
import shutil
from datetime import datetime
from db_helper import DBHelper
import const
import cloudant
import subprocess
import json
from typing import *

def execute_one() -> None:
    try:
        os.makedirs("./tmp/", exist_ok=True)

        db = DBHelper()
        job_id = db.get_import_job()
        if job_id is None:
            print("no job, wait")
            time.sleep(const.NO_JOB_WAIT)
            return
        
        try:
            job_doc = db.lock_import_job(job_id)
        except Exception as e:
            log("unable to lock, skip: ", e)
            return
        
        try:
            # download(job_doc)
            add_to_db(job_doc, db)
        except Exception as e:
            log("execution error: ", e)

            # release lock
            job_doc["lock_timestamp"] = 0
            job_doc.save()
            
    except Exception as e:
        log("unknown error: ", e)
    finally:
        log("clean up tmp folder")
        # shutil.rmtree('./tmp/')


def download(job_doc: cloudant.document) -> None:
    cmd: str = job_doc["curl_cmd"]
    print(cmd)
    exit_code = subprocess.call(cmd, shell=True)
    if exit_code != 0:
        raise Exception("unable to download")

def add_to_db(job_doc: cloudant.document, db: DBHelper) -> None:
    total_num = 0
    import_num = 0

    with open('./tmp/twitter.json', 'r') as f:
        # skip things like "{"total_rows":3877777,"offset":805584,"rows":["
        f.readline()
        for l in f:
            # skip last line
            if l.strip() == ']}':
                continue

            try:
                # load one doc
                data = json.loads(l.rstrip(",\r\n "))
                data = data["doc"]
                data.pop("_id", None)
                data.pop("_rev", None)
            except Exception as e:
                log("unknow parse error, skip: ", e)
                continue

            total_num += 1
            if db.add_tweet_import(data):
                import_num += 1

            if total_num % const.JOB_UPDATE_PER_TWEET == 0:
                print("t: ", total_num, "i", import_num)
                # update doc, mainly for checking if someone else taken over
                try:
                    job_doc["total_num"] = total_num
                    job_doc["import_num"] = import_num
                    job_doc.save()
                except Exception as e:
                    log("lock conflict: ", e)
                    return

    # complete
    try:
        job_doc["total_num"] = total_num
        job_doc["import_num"] = import_num
        job_doc["finished"] = True
        job_doc.save()
        log("finished")
    except Exception as e:
        log("unable to finish: ", e)
        return


def log(*args):
    print ("[" + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "]", *args)

def main() -> None:
    while True:
        execute_one()
        break
        time.sleep(2)


if __name__ == "__main__":
    main()

# dump scheme only
from db_helper import DBHelper
import config
import json

import subprocess

from furl import furl
import os

def dump_all(dump_dir: str) -> None:
    data = {}
    dbh = DBHelper()
    dbs = list(filter(lambda x: x[0] != '_', dbh.client.all_dbs()))

    url_obj = furl(config.couchdb_host)
    url_obj.username = config.couchdb_user
    url_obj.password = config.couchdb_auth_token
    url = url_obj.url

    for db in dbs:
        _url = url + db + "/_all_docs?include_docs=true&attachments=true"
        print(_url)

        cmd = r"""curl "{}" -G  -o "{}" """
        cmd = cmd.format(_url, os.path.join(dump_dir, db + ".json"))
        exit_code = subprocess.call(cmd, shell=True)
        if exit_code != 0:
            raise Exception("unable to download")

if __name__ == "__main__":
    dump_all("./ccc_db_dump_all/")

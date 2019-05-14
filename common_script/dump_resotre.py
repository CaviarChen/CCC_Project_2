from db_helper import DBHelper
import config
import json

# I will implement the restore function when we need to restore it.

def dump(filename: str, keep_auth: bool = False) -> None:
    data = {}
    dbh = DBHelper()
    dbs = list(filter(lambda x: x[0] != '_', dbh.client.all_dbs()))
    for db in dbs:
        dds = dbh.client[db].design_documents()
        if not keep_auth:
            dds = list(filter(lambda x: x['id'] != '_design/auth', dds))
        data[db] = dds
    with open(filename, 'w') as outfile:  
        json.dump(data, outfile)


if __name__ == "__main__":
    dump("./db_dump/without_auth.json", False)
    dump("./db_dump/with_auth.json", True)

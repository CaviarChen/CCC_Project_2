import time
from datetime import date, timedelta
from db_helper import DBHelper
import config


def add_import_job(start_date_s: str, end_date_s: str) -> None:
    start_date = date.fromisoformat(start_date_s)
    end_date = date.fromisoformat(end_date_s)
    db = DBHelper()
    while start_date < end_date:
        print(start_date)
        start_date += timedelta(days=1)

        date_str = "{},{},{}".format(start_date.year, start_date.month, start_date.day)
        cmd = config.curl_command_template.format(date_str, date_str)

        data = {
            '_id': start_date.isoformat(),
            'curl_cmd': cmd,
            'finished': False,
            'lock_timestamp': 0,
            'work_node': None,
            'total_num': None,
            'import_num': None
        }

        db.client["import_job"].create_document(data)
        


if __name__ == "__main__":
    add_import_job("2017-04-01", "2018-04-01")

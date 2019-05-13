import pytz
from datetime import datetime
from datetime import timezone


tweet_time = "Fri May 25 13:42:27 +0000 2018"


melb_time = datetime.strptime(tweet_time, '%a %b %d %H:%M:%S %z %Y')\
    .replace(tzinfo=timezone.utc).astimezone(pytz.timezone('Australia/Melbourne'))


print([melb_time.year, melb_time.month, melb_time.day, melb_time.hour, melb_time.minute, melb_time.second])


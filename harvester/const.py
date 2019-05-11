# 2018-4-2
TWEET_ID_CUT_OFF = 980578703653724161

STREAM_MAX_DB_ERROR_BEFORE_ABORT = 10

# 10 hour
USER_HARVEST_INTERVAL = 10 * 60 * 60

# when a job is considered timeout and will be taken by others
USER_HARVEST_TIMEOUT = 1 * 60 * 60

USER_NO_JOB_SLEEP_TIME = 5 * 60
USER_TWITTER_API_BACKOFF = 20 * 60

# too high will increase the cost of getting a job
# too low will increate the chance of conflict
FETCH_JOB_COUNT = 4

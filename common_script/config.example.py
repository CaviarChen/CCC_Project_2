import os

node_id = "00"
couchdb_host = "http://127.0.0.1:5984"
couchdb_user = None
couchdb_auth_token = None
couchdb_admin_party = True
# tweet_geo_limit = None
tweet_geo_limit = [144.3336, 145.8784, -38.5030, -37.1751]

curl_command_template = """
curl "http://127.0.0.1/couchdbro/twitter/_design/twitter/_view/summary" -G \
--data-urlencode 'start_key=["melbourne",{}]' \
--data-urlencode 'end_key=["melbourne",{}]' \
--data-urlencode 'reduce=false'  --data-urlencode 'include_docs=true'  --user "readonly:fakepassword"  -o ./tmp/twitter.json
"""

# node_id = os.environ["H_NODE_ID"]
# couchdb_host = os.environ["H_DB_HOST"]
# couchdb_user = os.environ["H_DB_USER"]
# couchdb_auth_token = os.environ["H_DB_TOKEN"]
# couchdb_admin_party = os.environ["H_DB_ADMIN_PARTY"].lower() == "true"
# tweet_geo_limit = os.environ["H_GEO_LIMIT"]
# if tweet_geo_limit is not None:
#     tmp = list(map(float, tweet_geo_limit.split(",")))
#     if len(tmp) == 4:
#         tweet_geo_limit = tmp

# print("node_id", node_id)
# print("couchdb_host", couchdb_host)
# print("couchdb_user", couchdb_user)
# print("couchdb_admin_party", couchdb_admin_party)
# print("tweet_geo_limit", tweet_geo_limit)

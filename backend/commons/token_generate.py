import jwt
import datetime

from commons.configs import JWT_SECRET, JWT_ALGORITHM

# JWT 生成
def generate_token(user_json):
    expire_time = datetime.datetime.now() + datetime.timedelta(hours=24)
    user_json['exp'] = int(expire_time.timestamp())
    return jwt.encode(user_json, JWT_SECRET, JWT_ALGORITHM)
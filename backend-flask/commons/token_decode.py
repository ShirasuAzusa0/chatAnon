from flask import request
import jwt

from commons.configs import JWT_SECRET, JWT_ALGORITHM

# token 信息还原
def token_decode():
    jwt_token = request.headers.get('Authorization', None)
    user_info = jwt.decode(jwt_token, JWT_SECRET, JWT_ALGORITHM)
    return user_info
from functools import wraps
from flask import request
import jwt

from commons.configs import JWT_SECRET, JWT_ALGORITHM

# 封装器实现 JWT 验证
def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # 获取 token
        jwt_token = request.headers.get('Authorization', None)
        if not jwt_token:
            return {
                'status': 'fail',
                'msg': 'User unauthorized'
            }, 401
        try:
            user_info = jwt.decode(jwt_token, JWT_SECRET, JWT_ALGORITHM)
            if not user_info or not user_info.get('attributes', None).get('email', None):
                return {
                    'status': 'fail',
                    'msg': 'User unauthorized'
                }, 401
        except Exception as e:
            return {
                'status': 'fail',
                'msg': f'{e}'
            }, 401
        result = f(*args, **kwargs)
        return result
    return wrapper
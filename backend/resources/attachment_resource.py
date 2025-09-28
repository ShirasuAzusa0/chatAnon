from flask_restful import Resource

from resources import api
from commons import utils

class PublicKeyResource(Resource):
    # 获取公钥
    def get(self):
        start_marker = "-----BEGIN PUBLIC KEY-----"
        end_marker = "-----END PUBLIC KEY-----"
        public_key_path = utils.get_key_path().joinpath("public_key.pem")
        with open(public_key_path, "r") as f:
            public_key = f.read()
            public_key = public_key.split(start_marker)[1].split(end_marker)[0].strip()
            f.close()
        return {
            'status': 'success',
            'msg': '公钥获取成功',
            'key': public_key
        }

api.add_resource(PublicKeyResource, '/api/login/publicKey')
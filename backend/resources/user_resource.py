from flask import request
from flask_restful import Resource, reqparse
from datetime import datetime
from werkzeug.datastructures import FileStorage

from commons.RSAkey_load import load_private_key
from commons.token_check import token_required
from commons.token_decode import token_decode
from commons.token_generate import generate_token
from models.users_model import UsersModel
from resources import api
from services.user_service import UsersService

from cryptography.hazmat.primitives.asymmetric import padding
import base64

class SignupResource(Resource):
    def __init__(self):
        self.private_key = load_private_key()

    # 注册
    def post(self):
        userName = request.json.get('userName', None)
        email = request.json.get('email', None)
        password = request.json.get('password', None)

        try:
            encrypted_password = base64.b64decode(password)       # 将Base64编码的密码字符串解码为字节数据
            user_password = self.private_key.decrypt(             # 使用私钥对解码后的字节数据进行解密
                encrypted_password,
                padding.PKCS1v15()
            ).decode('utf-8')                                     # 解密后的字节数据解码为UTF-8字符串
        except Exception as e:
            return {'status': 'fail', 'msg': f'解密失败：{e}'}, 400

        userId = UsersService().generate_userId()

        user_model = UsersModel(id=userId,
                                avatarUrl="https://avatars.githubusercontent.com/u/19370775",
                                userName=userName,
                                email=email,
                                password=user_password,
                                type='user',
                                selfDescription='这个用户很懒,什么都没有留下',
                                registerDate=datetime.now(),
                                reply=0, topics=0, follower=0, following=0)
        user_model = UsersService().signup(user_model)
        if user_model:
            user_json = user_model.serialize_mode1()
            # 生成一个JWT的token令牌
            jwt_token = generate_token(user_json)
            # 直接给前端返回token即可
            return {
                'status': 'success',
                'msg': '注册成功',
                'data': {
                    'userId': str(user_model.id),
                    'token': jwt_token
                }
            }
        else:
            return {
                'status': 'fail',
                'msg': '用户已存在'
            }, 400

class LoginResource(Resource):
    def __init__(self):
        self.private_key = load_private_key()

    # 登录
    def post(self):
        account = request.json.get('account', None)
        user_password = request.json.get('password', None)

        try:
            encrypted_password = base64.b64decode(user_password)    # 将Base64编码的密码字符串解码为字节数据
            user_password = self.private_key.decrypt(               # 使用私钥对解码后的字节数据进行解密
                encrypted_password,
                padding.PKCS1v15()
            ).decode('utf-8')                                       # 解密后的字节数据解码为UTF-8字符串
        except Exception as e:
            return {'status': 'fail', 'msg': f'解密失败：{e}'}, 400

        user_model = UsersService().login(account, user_password)
        if user_model:
            user_json = user_model.serialize_mode1()
            # 生成一个JWT的token令牌
            jwt_token = generate_token(user_json)
            # 直接给前端返回token即可
            return {
                'status': 'success',
                'msg': '登录成功',
                'data': {
                    'userId': str(user_model.id),
                    'token': jwt_token
                }
            }
        else:
            return {
                'status': 'fail',
                'msg': '用户输入的邮箱或密码不正确'
            }, 404

class SettingResource(Resource):
    def __init__(self):
        # 定义一个语法分析器parser，其值为RequestParser函数，用于处理请求参数的输入
        self.parser = reqparse.RequestParser()
        # 通过add_argument方法定义需要解析的参数
        self.parser.add_argument("avatar",  # 参数名称
                                 type=FileStorage,  # 文件存储类型
                                 location="files",  # 提取参数的位置，将数据转换成文件存储
                                 help="Please private avatar file")  # 请求中没有参数则报错的内容
        # 加载私钥
        self.private_key = load_private_key()

    # 处理用户信息修改请求
    @token_required
    def put(self):
        user_email = request.form.get('email', None)
        user_name = request.form.get('userName', None)
        user_description = request.form.get('selfDescription', None)
        user_password = request.form.get('password', None)

        if user_password != '' and user_password is not None:
            try:
                encrypted_password = base64.b64decode(user_password)    # 将Base64编码的密码字符串解码为字节数据
                user_password = self.private_key.decrypt(               # 使用私钥对解码后的字节数据进行解密
                    encrypted_password,
                    padding.PKCS1v15()
                ).decode('utf-8')                                       # 解密后的字节数据解码为UTF-8字符串

            except Exception as e:
                return {'status': 'fail', 'msg': f'解密失败：{e}'}, 400

        # 获取文件，通过self.parser.parse_args()解析请求参数并从中获取名为attachment的文件
        attachment_file = self.parser.parse_args().get("avatar")
        # 上传内容只允许为图片
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if attachment_file:
            # 匹配文件拓展名
            file_extension = attachment_file.filename.rsplit('.', 1)[1].lower()
            # 检查文件拓展名是否为允许的图片格式
            if file_extension not in allowed_extensions and file_extension is not None:
                return {'status': 'fail', 'msg': 'Invalid file format'}, 400

            save_path = "/static/avatar/" + attachment_file.filename
            # 相对路径，保存在数据库中和供前端调用
            avatar_path = "http://120.76.138.103:5001/avatar/" + attachment_file.filename
            # 将文件按当前路径保存
            attachment_file.save(save_path)

        # 解析token获取用户id
        user_info = token_decode()
        user_id = user_info.get('id', None)
        if not attachment_file:
            avatar_path = None
        user_model = UsersService().update_user_data(user_id, avatar_path, user_email, user_name, user_description, user_password)
        if user_model:
            return {
                'status': 'success',
                'msg': '用户信息更新成功'
            }

        else:
            return {'status': 'fail', 'msg':'用户信息更新失败'}, 404

class UserPageResource(Resource):
    # 获取用户主页信息
    @token_required
    def get(self, userId:int):
        user_model = UsersService().get_user_by_id(userId)
        if user_model is not None:
            return user_model.serialize_mode2()
        else:
            return {'status': 'fail', 'message': '找不到该用户', 'data': None},404

api.add_resource(SignupResource, '/api/user/register')
api.add_resource(LoginResource, '/api/user/login')
api.add_resource(SettingResource, '/api/user/setting')
api.add_resource(UserPageResource, '/api/user/profile/<int:userId>')
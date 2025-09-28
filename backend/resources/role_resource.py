from flask import request
from flask_restful import Resource, reqparse
from future.backports.datetime import datetime
from sqlalchemy import VARCHAR
from werkzeug.datastructures import FileStorage

from resources import api

from commons.RSAkey_load import load_private_key
from models import RolesModel
from services.role_service import RolesService
from commons.token_check import token_required
from commons.token_decode import token_decode
import os

class RoleResource(Resource):
    # 获取角色的具体内容
    def get(self, roleId:int):
        userId = request.args.get("userId", None, type=int)
        role = RolesService().get_role_by_id(roleId=roleId)
        if role is not None:
            res = {
                'status': 'success',
                'msg': '角色详细信息获取成功',
                'data': role.serialize_mode2()
            }
            if userId is None:
                return res
            else:
                res['data']['role']['isFavorite'] = RolesService().favorite_role_check(roleId, userId)
                res['data']['role']['isLiked'] = RolesService().like_role_check(roleId, userId)
                return res
        else:
            return {
                'status': 'fail',
                'msg': '该角色不存在'
            }, 404

class RecommendRoleListResource(Resource):
    # 获取推荐角色列表
    def get(self):
        role_list = RolesService().get_recommend_roles()
        if role_list is None:
            return {
                'status': 'fail',
                'msg': '获取推荐角色列表失败'
            }, 404
        else:
            recommend_roles = [role_model for role_model, _ in role_list]
            return {
                'status': 'success',
                'msg': '推荐角色列表获取成功',
                'data': [role.serialize_mode1() for role in recommend_roles]
            }

class NewestRoleResource(Resource):
    # 获取最新角色列表
    def get(self):
        role_list = RolesService().get_newest_roles()
        if role_list is None:
            return {
                'status': 'fail',
                'msg': '获取最新角色列表失败'
            }, 404
        else:
            newest_roles = [role_model for role_model in role_list]
            return {
                'status': 'success',
                'msg': '最新角色列表获取成功',
                'data': [role.serialize_mode1() for role in newest_roles]
            }

class SearchRoleResource(Resource):
    # 搜索获取角色概览信息
    def get(self, search:VARCHAR):
        search_list = RolesService().get_roles_by_search(search)
        if search_list:
            return {
                'status': 'success',
                'msg': '已找到所搜索的角色！',
                'data': [role.serialize_mode1() for role in search_list]
            }, 200
        else:
            return {
                'status': 'fail',
                'msg': '搜索的角色不存在！'
            }

class PostRoleResource(Resource):
    # 初始化方法
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

    # 创建新的角色
    @token_required
    def post(self):
        roleName = request.form.get('roleName', None)
        description = request.form.get('description', None)
        tags = request.form.get('tags', None)
        if not tags:
            tags = list()
            tags.append({"roleTagId": 0, "roleTagName": "通用"})
        short_info = "暂无简介"

        roleId = RolesService().generate_roleId()
        user_info = token_decode()
        authorId = user_info.get('userId', None)
        createdAt = datetime.now()

        avatarURL = None

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

            save_path = os.path.join(os.getcwd(), "avatar")
            # 相对路径，保存在数据库中和供前端调用
            # avatarURL = "http://120.76.138.103:5001/avatar/" + attachment_file.filename
            avatarURL = "http://127.0.0.1:5000/avatar/" + attachment_file.filename
            # 将文件按当前路径保存
            attachment_file.save(save_path)

        new_role = RolesModel(roleId=roleId,
                              roleName=roleName,
                              authorId=authorId,
                              likesCount=0,
                              favoriteCount=0,
                              avatarURL=avatarURL,
                              description=description,
                              short_info=short_info,
                              createdAt=createdAt)

        new_role = RolesService().save_role(new_role, tags)

        if new_role:
            return {
                'status': 'success',
                'msg': '新角色创建成功',
                'data': {
                    'roleId': new_role.roleId,
                    'roleName': new_role.roleName
                }
            }
        else:
            return {
                'status': 'fail',
                'msg': '新角色创建失败'
            }, 404

class RoleLikesResource(Resource):
    # 点赞/取消点赞
    @token_required
    def put(self, roleId:int):
        user_info = token_decode()
        userId = user_info.get('userId', None)
        is_liked = RolesService().like_role_check(roleId, userId)
        RolesService().like_data_update(is_liked, roleId, userId)
        likesCount = RolesService().set_likes_to_role(is_liked, roleId)

        res = {'status': 'success'}
        if is_liked:
            res['msg'] = '取消点赞成功'
        else:
            res['msg'] = '点赞成功'
        res['likesCount'] = likesCount

        if likesCount is not None:
            return res
        else:
            return {
                'status': 'fail',
                'msg': '点赞失败'
            }, 404

class FavoriteRoleResource(Resource):
    # 收藏/取消收藏
    @token_required
    def put(self, roleId:int):
        user_info = token_decode()
        userId = user_info.get('userId', None)
        is_favorite = RolesService().favorite_role_check(roleId, userId)
        RolesService().favorite_data_update(is_favorite, roleId, userId)
        res = {'status': 'success'}
        if roleId:
            if is_favorite:
                res["msg"] = "取消收藏成功"
            else:
                res["msg"] = "收藏成功"
            res[roleId] = roleId
            return res
        else:
            return {
                'status': 'fail',
                'msg': '收藏失败'
            }, 404

class UserFavoriteRoleListResource(Resource):
    # 获取用户收藏的角色
    @token_required
    def get(self):
        user_info = token_decode()
        userId = user_info.get('userId', None)
        if userId is None:
            return {
                'status': 'fail',
                'msg': '用户获取失败'
            }, 404

        favorite_role_list = RolesService().get_favorite_roles(userId)
        res = {
            "status": "success",
            "msg": "用户收藏角色列表获取成功",
            "data": []
        }
        for role in favorite_role_list:
            res["data"].append(role.serialize_mode1())

        return res

class UserReleasedRoleListResource(Resource):
    # 获取用户创建过的角色
    @token_required
    def get(self):
        user_info = token_decode()
        userId = user_info.get('userId', None)
        if userId is None:
            return {
                'status': 'fail',
                'msg': '用户获取失败'
            }, 404

        released_role_list = RolesService().get_released_roles(userId)
        if released_role_list:
            res = {
                "status": "success",
                "msg": "获取用户创建过的角色列表成功",
                "data": {"roles": []}
            }
            for role in released_role_list:
                res["data"]["roles"].append(role.serialize_mode1())
            return res
        else:
            return {
                "status": "fail",
                "msg": "获取用户创建过的角色列表失败"
            }, 404

class UserHistoryRoleResource(Resource):
    # 获取历史的聊天角色列表
    @token_required
    def get(self):
        user_info = token_decode()
        userId = user_info.get('userId', None)
        if userId is None:
            return {
                'status': 'fail',
                'msg': '用户获取失败'
            }, 404

        history_role_list = RolesService().get_history_roles(userId)
        if history_role_list:
            res = {
                "status": "success",
                "msg": "获取历史的聊天角色列表成功",
                "data": {"roles": []}
            }
            for role in history_role_list:
                res["data"]["roles"].append(role.serialize_mode1())
            return res
        else:
            return {
                "status": "fail",
                "msg": "获取历史的聊天角色列表失败"
            }, 404

api.add_resource(RoleResource, '/api/role-list/role/<int:roleId>')
api.add_resource(RecommendRoleListResource, '/api/role-list/recommended')
api.add_resource(NewestRoleResource, '/api/role-list/newest')
api.add_resource(PostRoleResource, '/api/role-list/new')
api.add_resource(RoleLikesResource, '/api/role-list/role/<int:roleId>/likes')
api.add_resource(FavoriteRoleResource, '/api/role-list/role/<int:roleId>/favorite')
api.add_resource(UserFavoriteRoleListResource, '/api/role-list/favorite')
api.add_resource(UserReleasedRoleListResource, '/api/role-list/released')
api.add_resource(SearchRoleResource, '/api/role-list/search/<string:search>')
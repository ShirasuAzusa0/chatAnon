from flask import request
from flask_restful import Resource

from resources import api

from models import RolesModel
from services.role_service import RolesService
from commons.token_check import token_required
from commons.token_decode import token_decode

class RoleResource(Resource):
    # 获取角色的具体内容
    def get(self, roleId:int):
        userId = request.args.get("userId", None, type=int)
        role = RolesService().get_role_by_id(roleId=roleId)
        if role is not None:
            res = {
                'status': 'success',
                'msg': '角色详细信息获取成功',
                'data': {
                    'role': role.serialize_mode2()
                }
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
                'data': {
                    'roles': [role.serialize_mode1() for role in recommend_roles]
                }
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
            newest_roles = [role_model for role_model, _ in role_list]
            return {
                'status': 'success',
                'msg': '最新角色列表获取成功',
                'data': {
                    'roles': [role.serialize_mode1() for role in newest_roles]
                }
            }

class PostRoleResource(Resource):
    # 创建新的角色
    @token_required
    def post(self):
        data = request.json.get('data', None)
        roleName = data.get('name', None)
        tags = data.get('tags', None)
        avatarURL = data.get('avatarURL', None)
        if not tags:
            tags.append({'tagId': 0, 'tagName': '通用'})
        description = data.get('description', None)
        short_info = data.get('short_info', None)

        roleId = RolesService().generate_roleId()
        user_info = token_decode()
        authorId = user_info.get('userId', None)

        new_role = RolesModel(roleId=roleId,
                              roleName=roleName,
                              authorId=authorId,
                              likesCount=0,
                              favoriteCount=0,
                              avatarURL=avatarURL,
                              description=description,
                              short_info=short_info)

        new_role = RolesService().save_role(new_role, tags)

        if new_role:
            return {
                'status': 'success',
                'msg': '新角色创建成功',
                'roleMeta': {
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
            "favorites": []
        }
        for role in favorite_role_list:
            res["favorites"].append(role.serialize_mode1())

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

api.add_resource(RoleResource, '/api/role-list/role/<int:roleId>')
api.add_resource(RecommendRoleListResource, '/api/role-list/recommended')
api.add_resource(NewestRoleResource, '/api/role-list/newest')
api.add_resource(PostRoleResource, '/api/role-list/create-role')
api.add_resource(RoleLikesResource, '/api/role-list/role/<int:roleId>/likes')
api.add_resource(FavoriteRoleResource, '/api/role-list/role/<int:roleId>/favorite')
api.add_resource(UserFavoriteRoleListResource, '/api/user/role/favorite')
api.add_resource(UserReleasedRoleListResource, '/api/user/role/released')
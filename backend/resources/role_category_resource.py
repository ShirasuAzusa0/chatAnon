from sqlalchemy import VARCHAR
from flask_restful import Resource

from resources import api
from services.roleCategories_service import RoleCategoriesService

class RoleTagsResource(Resource):
    # 获取所有标签
    def get(self):
        tag_list = RoleCategoriesService().get_all_tags()
        if tag_list is None:
            return {'status': 'success', 'msg': 'The role tags list is empty'}
        else:
            return {
                'status': 'success',
                'msg': '所有角色标签获取成功',
                'data': [tag.serialize_mode2() for tag in tag_list]
            }

class TagRoleListResource(Resource):
    # 获取指定标签对应的角色列表
    def get(self, tag:VARCHAR):
        tag_roleList = RoleCategoriesService().get_role_list_by_tagName(tag)
        if tag_roleList:
            return {
                "status": "success",
                "msg": "获取指定标签对应的角色列表成功",
                "data": tag_roleList.serialize_mode3()
            }
        else:
            return {
                "status": "success",
                "msg": "获取指定标签对应的角色列表失败"
            }

api.add_resource(RoleTagsResource, '/api/role-list/tags')
api.add_resource(TagRoleListResource, '/api/role-list/<string:tag>')
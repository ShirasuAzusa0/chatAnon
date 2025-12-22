from sqlalchemy import VARCHAR
from flask_restful import Resource

from resources import api
from services.postCategories_service import CategoriesService

class TagsResource(Resource):
    # 处理获取所有标签要求
    def get(self):
        tag_list = CategoriesService().get_all_tags()
        if tag_list is None:
            return {'status': 'success', 'msg': 'The post tags list is empty'}
        else:
            return {
                'status': 'success',
                'msg': '所有帖子标签获取成功',
                'data': [tag_model.serialize_mode2() for tag_model in tag_list]
            }

class TagsPostsListResource(Resource):
    # 获取指定标签对应的帖子列表
    def get(self, tag:VARCHAR):
        tag_postList =  CategoriesService().get_post_list_by_tagName(tag)
        if tag_postList:
            return {
                "status": "success",
                "msg": "获取指定标签对应的帖子列表成功",
                "data": tag_postList.serialize_mode3()
            }, 200
        else:
            return {
                "status": "fail",
                "msg": "获取指定标签对应的帖子列表失败"
            }, 404


api.add_resource(TagsResource, '/api/forum/tags')
api.add_resource(TagsPostsListResource, '/api/forum/<string:tag>/posts')
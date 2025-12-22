from sqlalchemy import VARCHAR, INT, Select, asc

from models.categories_model import CategoriesModel
from resources import db

class CategoriesService:
    # 获取所有标签的方法
    def get_all_tags(self):
        query = Select(CategoriesModel).order_by(asc(CategoriesModel.tagId))
        return db.session.scalars(query).all()

    # 通过编号获取标签
    def get_tag_by_id(self, postId:INT):
        return db.session.get(CategoriesModel ,postId)

    # 获取指定标签对应的帖子列表
    def get_post_list_by_tagName(self, tagName:VARCHAR):
        return CategoriesModel.query.filter_by(tagName=tagName).first()
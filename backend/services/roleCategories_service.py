from sqlalchemy import VARCHAR, INT, Select, asc

from models.roleCategories_model import RoleCategoriesModel
from resources import db

class RoleCategoriesService:
    # 获取所有角色标签的方法
    def get_all_tags(self):
        query = Select(RoleCategoriesModel).order_by(asc(RoleCategoriesModel.roleTagId))
        return db.session.scalars(query).all()

    # 通过编号获取角色标签
    def get_tag_by_id(self, roleTagId:INT):
        return db.session(RoleCategoriesModel, roleTagId)

    # 获取只当标签对应的角色列表
    def get_role_list_by_tagName(self, tagName:VARCHAR):
        return RoleCategoriesModel.query.filter_by(tagName=tagName).first()
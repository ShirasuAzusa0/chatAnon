from sqlalchemy import VARCHAR, INT, DATETIME
from sqlalchemy.orm import Mapped, mapped_column, relationship
from resources import db

from models.post_category_model import post_category

# 数据库mysql映射类，该类的对象用来暂存从数据库中读取出来的数据，通过格式化为json数据后返回给前端
class CategoriesModel(db.Model):
    __tablename__ = 'categories'
    tagId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    tagName: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    hueColor: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    postsCount: Mapped[INT] = mapped_column(INT, nullable=False)
    lastPostTime: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)

    # 定义posts成员变量与PostsModel映射类的关系（多对多关系）
    posts = relationship('PostsModel', secondary=post_category, back_populates='categories')

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode1(self):
        return {
            'tagId': self.tagId,
            'tagName': str(self.tagName)
        }

    def serialize_mode2(self):
        return {
            'tagId': self.tagId,
            'title': str(self.tagName),
            'hueColor': str(self.hueColor),
            'description': str(self.description),
            'postsCount': self.postsCount,
            'lastPostTime': self.lastPostTime.isoformat().replace('T',' ')
        }

    def serialize_mode3(self):
        return {
            'tagName': self.tagName,
            'posts': [post.serialize_mode1() for post in self.posts]
        }
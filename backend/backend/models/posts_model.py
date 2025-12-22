from sqlalchemy import VARCHAR, DATETIME, INT, ForeignKey
from sqlalchemy.dialects.mysql import  LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.post_category_model import post_category
from models.post_like_model import post_like
from models.post_favorite_model import post_favorites
from resources import db

class PostsModel(db.Model):
    __tablename__ = 'posts'
    postId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    title: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    authorId: Mapped[INT] = mapped_column(INT, ForeignKey('users.userId'), nullable=False)
    createdAt: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)
    lastCommentedAt: Mapped[DATETIME] = mapped_column(DATETIME, nullable=True)
    lastCommentedUserId: Mapped[INT] = mapped_column(INT, ForeignKey('users.userId'), nullable=True)
    commentsCount: Mapped[INT] = mapped_column(INT, nullable=False)
    likesCount: Mapped[INT] = mapped_column(INT, nullable=False)
    content: Mapped[LONGTEXT] = mapped_column(LONGTEXT, nullable=False)

    # 定义 author 成员变量与 UsersModel 映射类的关系，明确指定 author 关系使用 authorId 外键
    author = relationship("UsersModel", foreign_keys=[authorId], back_populates="posts")

    # 定义 categories 成员变量与 CategoryModels 映射类的关系（多对多），表明了 categories 是一个列表，列内元素是 categories 表映射实例
    categories = relationship("CategoriesModel", secondary=post_category, back_populates="posts")

    # 定义 like 成员变量与 userModel 映射类（多对多）
    userPostLiked = relationship("UsersModel", secondary=post_like, back_populates="postLiked")

    # 定义 favorite 成员变量与 userModel 映射类（多对多）
    userPostFavorite = relationship("UsersModel", secondary=post_favorites, back_populates="postFavorite")

    # 定义 comments 成员变量与 CommentsModel 映射类的关系
    comments = relationship("CommentsModel", back_populates="posts")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode1(self):
        return {
            'postId': self.postId,
            'title': str(self.title),
            'author': self.author.serialize_mode1() if self.author else None,
            'tags': [category.serialize_mode1() for category in self.categories],
            'createdAt': self.createdAt.isoformat().replace('T', ' ') if self.createdAt else None,
            'lastCommentedAt': self.lastCommentedAt.isoformat().replace('T', ' ') if self.lastCommentedAt else None,
            'lastCommentedUser': self.author.serialize_mode4() if self.author else None,
            "commentsCount": self.commentsCount
        }

    # 序列化方法，需要序列化为json数据后在传输给前端
    def serialize_mode2(self):
        return {
            'postId': self.postId,
            'title': str(self.title),
            'author': self.author.serialize_mode1() if self.author else None,
            'tags': [category.serialize_mode1() for category in self.categories],
            'createdAt': self.createdAt.isoformat().replace('T', ' ') if self.createdAt else None,
            'lastCommentedAt': self.lastCommentedAt.isoformat().replace('T', ' ') if self.lastCommentedAt else None,
            "commentsCount": self.commentsCount,
            "likesCount": self.likesCount,
            "content": str(self.content),
            "comments": [comment.serialize() for comment in
                         sorted(self.comments, key=lambda comment: comment.createdAt)]
        }
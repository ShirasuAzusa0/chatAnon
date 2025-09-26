from sqlalchemy import VARCHAR, DATETIME, INT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from resources import db

from models.role_like_model import role_like
from models.role_favorite_model import role_favorites
from models.post_like_model import post_like
from models.post_favorite_model import post_favorites
from models.comment_like_model import comment_like

class UsersModel(db.Model):
    __tablename__ = 'users'
    userId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    userName: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    email: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    password: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    avatarURL: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    selfDescription: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    registerDate: Mapped[DATETIME] = mapped_column(INT, nullable=False)
    reply: Mapped[INT] = mapped_column(INT, nullable=False)
    topics: Mapped[INT] = mapped_column(INT, nullable=False)
    follower: Mapped[INT] = mapped_column(INT, nullable=False)
    following: Mapped[INT] = mapped_column(INT, nullable=False)

    # 定义 roleFavorite 成员变量与 RolesModel 映射类的关系（多对多）
    roleFavorite = relationship("RolesModel", secondary=role_favorites, back_populates="userRolesFavorite")

    # 定义 roleLiked 成员变量与 RolesModel 映射类的关系（多对多）
    roleLiked = relationship("RolesModel", secondary=role_like, back_populates="userRoleLiked")

    # 定义 postsLiked 成员变量与 PostsModel 映射类的关系（多对多）
    postLiked = relationship("PostsModel", secondary=post_like, back_populates="userPostLiked")

    # 定义 commentsLiked 成员变量与 CommentsModel 映射类的关系（多对多）
    commentLiked = relationship("CommentsModel", secondary=comment_like, back_populates="userCommentLiked")

    # 定义 postsFavorite 成员变量与 PostsModel 映射类关系（多对多）
    postFavorite = relationship("PostsModel", secondary=post_favorites, back_populates="userPostFavorite")

    # users 与 roles 反向关系
    roles = relationship("RolesModel", foreign_keys="RolesModel.authorId", back_populates="author")

    # users 与 posts 反向关系
    posts = relationship("PostsModel", foreign_keys="PostsModel.authorId", back_populates="author")

    # users 与 comments 反向关系
    comments = relationship("CommentsModel", back_populates="author")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode1(self):
        return {
            'userId': self.userId,
            'attributes': {
                'avatarUrl': str(self.avatarUrl),
                'userName': str(self.userName),
                'email': str(self.email),
                'type': str(self.type)
            }
        }

    def serialize_mode2(self):
        return {
            'status': 'success',
            'message': '成功获取用户信息',
            'data': {
                'userId': str(self.userId),
                'userName': str(self.userName),
                'email': str(self.email),
                'avatar': str(self.avatarUrl),
                'selfDescription': str(self.selfDescription),
                'registerDate': self.registerDate.isoformat().replace('T', ' '),
                'counts': {
                    'reply': self.reply,
                    'topics': self.topics,
                    'follower': self.follower,
                    'following': self.following
                }
            }
        }

    def serialize_mode3(self):
        return {
            'status': 'success',
            'msg': '用户信息更新成功',
            'data': {
                'userName': str(self.userName),
                'email': str(self.email),
                'avatar': str(self.avatarUrl),
                'selfDescription': str(self.selfDescription),
            }
        }

    def serialize_mode4(self):
        return {
            'userId': str(self.userId),
            'userName': str(self.userName)
        }
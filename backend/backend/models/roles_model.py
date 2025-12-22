from sqlalchemy import VARCHAR, INT, DATETIME, ForeignKey
from sqlalchemy.dialects.mysql import  LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.role_category_model import role_category
from models.role_history_model import role_history
from models.role_like_model import role_like
from models.role_favorite_model import role_favorites
from resources import db


class RolesModel(db.Model):
    __tablename__ = 'roles'
    roleId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    roleName: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    authorId: Mapped[INT] = mapped_column(INT, ForeignKey('users.userId'), nullable=False)
    likesCount: Mapped[INT] = mapped_column(INT, nullable=False)
    favoriteCount: Mapped[INT] = mapped_column(INT, nullable=False)
    avatarURL: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[LONGTEXT] = mapped_column(LONGTEXT, nullable=False)
    short_info: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    createdAt: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)

    # 定义 author 成员变量与 UsersModel 映射类的关系，明确指定 author 关系使用 authorId 外键
    author = relationship("UsersModel", foreign_keys=[authorId], back_populates="roles")

    # 定义 rolecategories 成员变量与 roleCategoriesModel 映射类的关系（多对多），表明了 rolecategories 是一个列表， 列内元素是 rolecategories 表映射实例
    rolecategories = relationship("RoleCategoriesModel", secondary=role_category, back_populates="roles")

    # 定义 like 成员变量与 userModel 映射类的关系（多对多）
    userRoleLiked = relationship("UsersModel", secondary=role_like, back_populates="roleLiked")

    # 定义 favorite 成员变量与 userModel 映射类的关系（多对多）
    userRolesFavorite = relationship("UsersModel", secondary=role_favorites, back_populates="roleFavorite")

    # 定义 history（聊天角色历史记录） 成员变量与 userModel 映射类的关系（多对多）
    userRoleHistory = relationship("UsersModel", secondary=role_history, back_populates="roleHistory")

    # role 与 chatrooms 反向关系
    chatrooms = relationship("chatRoomModel", back_populates="role")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode1(self):
        return {
            'roleId': self.roleId,
            'roleName': str(self.roleName),
            'likesCount': self.likesCount,
            'favoriteCount': self.favoriteCount,
            'avatarURL': self.avatarURL,
            'short_info': self.short_info
        }

    def serialize_mode2(self):
        return {
            'roleId': self.roleId,
            'roleName': str(self.roleName),
            'likesCount': self.likesCount,
            'favoriteCount': self.favoriteCount,
            'avatarURL': self.avatarURL,
            'description': self.description
        }
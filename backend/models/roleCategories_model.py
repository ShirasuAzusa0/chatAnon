from sqlalchemy import VARCHAR, INT, DATETIME
from sqlalchemy.orm import Mapped, mapped_column, relationship
from resources import db

from models.role_category_model import role_category

class RoleCategoriesModel(db.Model):
    __tablename__ = 'rolecategories'
    roleTagId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    roleTagName: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    hueColor: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    description: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)
    rolesCount: Mapped[INT] = mapped_column(INT, nullable=False)
    LastUpdateTime: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)

    # 定义 roles 成员变量与 RolesModel 映射类的关系（多对多）
    roles = relationship('RolesModel', secondary=role_category, back_populates='rolecategories')

    def serialize_mode1(self):
        return {
            'roleTagId': self.roleTagId,
            'roleTagName': str(self.roleTagName)
        }

    def serialize_mode2(self):
        return {
            'tagId': self.roleTagId,
            'tagName': str(self.roleTagName),
            'hueColor': str(self.hueColor),
            'Counts': self.rolesCount,
            'lastUpdateTime': self.LastUpdateTime.isoformat().replace('T',' ')
        }

    def serialize_mode3(self):
        return {
            'roleTagName': str(self.roleTagName),
            'roles': [role.serialize_mode1() for role in self.roles]
        }
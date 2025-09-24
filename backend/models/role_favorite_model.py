from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 role_favorites
role_favorites = Table(
    "role_favorites",
    db.metadata,
    Column("roleId", ForeignKey("roles.postId"), primary_key=True, nullable=False),
    Column("userId", ForeignKey("users.userId"), primary_key=True, nullable=False)
)
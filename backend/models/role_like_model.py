from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 role_like
role_like = Table(
    "role_like",
    db.metadata,
    Column("roleId", ForeignKey("roles.roleId"), primary_key=True, nullable=False),
    Column("userId", ForeignKey("users.userId"), primary_key=True, nullable=False)
)
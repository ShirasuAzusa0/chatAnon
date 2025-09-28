from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 role_history
role_history = Table(
    "role_history",
    db.metadata,
    Column("userId", ForeignKey("users.userId"), primary_key=True, nullable=False),
    Column("roleId", ForeignKey("roles.roleId"), primary_key=True, nullable=False)
)
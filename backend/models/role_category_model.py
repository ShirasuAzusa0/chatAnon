from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 role_category
role_category = Table(
    "role_category",
    db.metadata,
    Column("roleId", ForeignKey("roles.roleId"), primary_key=True, nullable=False),
    Column("tagId", ForeignKey("rolecategories.roleTagId"), primary_key=True, nullable=False)
)
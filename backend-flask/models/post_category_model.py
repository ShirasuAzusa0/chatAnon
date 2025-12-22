from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 post_category
post_category = Table(
    "post_category",
    db.metadata,
    Column("postId", ForeignKey("posts.postId"), primary_key=True, nullable=False),
    Column("tagId", ForeignKey("categories.tagId"), primary_key=True, nullable=False)
)
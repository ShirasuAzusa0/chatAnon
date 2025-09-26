from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 post_favorites
post_favorites = Table(
    "post_favorite",
    db.metadata,
    Column("postId", ForeignKey("posts.postId"), primary_key=True, nullable=False),
    Column("userId", ForeignKey("users.userId"), primary_key=True, nullable=False)
)
from sqlalchemy import ForeignKey, Table, Column
from resources import db

# 构建并引用关系表 comment_like
comment_like = Table(
    "comment_like",
    db.metadata,
    Column("commentId", ForeignKey("comments.commentId"), primary_key=True, nullable=False),
    Column("userId", ForeignKey("users.userId"), primary_key=True, nullable=False)
)
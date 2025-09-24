from sqlalchemy import INT, DATETIME,ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from resources import db

class CommentsModel(db.Model):
    __tablename__ = 'comments'
    commentId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    content: Mapped[LONGTEXT] = mapped_column(LONGTEXT, nullable=False)
    authorId: Mapped[INT] = mapped_column(INT, ForeignKey('users.userId'), nullable=False)
    createdAt: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)
    likesCount: Mapped[INT] = mapped_column(INT, nullable=False)
    repliedId: Mapped[INT] = mapped_column(INT, nullable=True)
    postId: Mapped[INT] = mapped_column(INT, ForeignKey('posts.postId'), nullable=False)

    # 定义 comments 成员变量与 UsersModel 映射类的关系（多对多）
    userCommentLiked = relationship("UsersModel", back_populates="commentLiked")

    # 定义 author 成员变量与 UsersModel 映射类的关系
    author = relationship("UsersModel", back_populates="comments")

    # 定义 posts 成员变量与 PostsModel 映射类的关系
    posts = relationship("PostsModel", back_populates="comments")

    def serialize(self):
        return {
            'commentId': str(self.commentId),
            'author': self.author.serialize_mode1() if self.author else None,
            'content': str(self.content),
            'createdAt': self.createdAt.isoformat().replace('T',' '),
            'likesCount': self.likesCount,
            'repliedID': str(self.repliedID)
        }
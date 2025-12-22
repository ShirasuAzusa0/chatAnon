from sqlalchemy import INT, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column,relationship
from resources import db

class PartsModel(db.Model):
    __tablename__ = 'parts'
    partId: Mapped[INT] = mapped_column(INT, primary_key=True, autoincrement=True, nullable=False)
    content: Mapped[LONGTEXT] = mapped_column(LONGTEXT, nullable=False)
    messageId: Mapped[INT] = mapped_column(INT, ForeignKey('messages.messageId'), nullable=False)

    # 在 PartsModel 中添加 messages 反向关系
    messages = relationship("MessagesModel", back_populates="parts")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize(self):
        return self.content
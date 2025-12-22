from sqlalchemy import INT, VARCHAR, ForeignKey, DATETIME
from sqlalchemy.orm import Mapped, mapped_column,relationship
from resources import db

class ConversationsModel(db.Model):
    __tablename__ = 'conversations'
    userId: Mapped[INT] = mapped_column(INT,ForeignKey('users.id'), nullable=False)
    ConversationId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    create_time: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)
    update_time: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)
    title: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)

    # 定义author成员变量与UsersModel映射类的关系
    author = relationship("UsersModel", back_populates="conversations")

    # 定义messages成员变量与MessagesModel映射类的关系
    messages = relationship("MessagesModel", back_populates="conversations")

    # 定义chatroom成员变量与chatRoomModel映射类的关系
    chatroom = relationship("chatRoomModel", back_populates="conversations")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode1(self):
        return {
            'ConversationId': self.ConversationId,
            'create_time': self.create_time.isoformat().replace('T',' '),
            'title': str(self.title)
        }

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize_mode2(self):
        sorted_messages = sorted(self.messages, key=lambda msg: msg.create_time)
        return {
            'title': str(self.title),
            'create_time': self.create_time.isoformat().replace('T',' '),
            'update_time': self.update_time.isoformat().replace('T',' '),
            'messages': [message.serialize() for message in sorted_messages]
        }
from sqlalchemy import INT, VARCHAR
from sqlalchemy.orm import Mapped, mapped_column,relationship
from resources import db

class chatRoomModel(db.Model):
    __tablename__ = 'chatrooms'
    chatRoomId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    chatRoomName: Mapped[VARCHAR] = mapped_column(VARCHAR(255), nullable=False)

    # 在 chatRoomModel 中添加 conversations 反向关系
    conversations = relationship("ConversationsModel", back_populates="chatroom")

    # 定义user成员变量与UsersModel映射类的关系
    user = relationship("UsersModel", back_populates="chatrooms")

    # 定义role成员变量与RolesModel映射类的关系
    role = relationship("RolesModel", back_populates="chatrooms")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize(self):
        return {
            'chatRoomId': self.chatRoomId,
            'chatRoomName': str(self.chatRoomName)
        }
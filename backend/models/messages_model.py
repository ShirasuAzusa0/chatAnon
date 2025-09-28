from sqlalchemy import INT, ForeignKey, DATETIME, Enum
from sqlalchemy.orm import Mapped, mapped_column,relationship
from resources import db

class MessagesModel(db.Model):
    __tablename__ = 'messages'
    conversationId: Mapped[INT] = mapped_column(INT,ForeignKey('conversations.id'), nullable=False)
    messageId: Mapped[INT] = mapped_column(INT, primary_key=True, nullable=False)
    author: Mapped[Enum] = mapped_column(Enum('user','system'), nullable=False)
    create_time: Mapped[DATETIME] = mapped_column(DATETIME, nullable=False)
    update_time: Mapped[DATETIME] = mapped_column(DATETIME, nullable=True)
    status: Mapped[Enum] = mapped_column(Enum('success','fail'), nullable=False)
    end_turn: Mapped[Enum] = mapped_column(Enum('True','False'), nullable=False)
    content_type: Mapped[Enum] = mapped_column(Enum('text','picture'), nullable=False)
    parent: Mapped[INT] = mapped_column(INT, nullable=True)

    # 在 MessagesModel 中添加 conversations 反向关系
    conversations = relationship("ConversationsModel", back_populates="messages")

    # 定义parts成员变量与PartsModel映射类的关系
    parts = relationship("PartsModel", back_populates="messages")

    # 定义children成员变量与ChildrenModel映射类的关系
    children = relationship("ChildrenModel", back_populates="messages")

    # 序列化方法，需要序列化为json数据后再传输给前端
    def serialize(self):
        return {
            str(self.messageId): {
                'id': self.messageId,
                'info': {
                    'id': self.messageId,
                    'author': str(self.author),
                    'create_time': self.create_time.isoformat().replace('T',' '),
                    'update_time': (self.update_time.isoformat().replace('T',' ') if self.update_time else None),
                    'content': {
                        'content_type': str(self.content_type),
                        'parts': [part.content for part in self.parts],
                    },
                    'status': str(self.status),
                    'end_turn': str(self.end_turn),
                },
                'parent': self.parent,
                'children': [child.childrenId for child in self.children]
            }
        }
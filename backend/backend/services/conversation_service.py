from sqlalchemy import Select, asc, func

from models.conversations_model import ConversationsModel
from resources import db

# 启用数据库服务的类，定义了对数据库的增、删、改、查等各类操作，并将结果返回
class ConversationsService:
    # 获取指定聊天的内容
    def get_conversation_messages_by_id(self, conversationId:int):
        return db.session.get(ConversationsModel, conversationId)

    # 查询并获取用户在线聊天的历次聊天记录
    def get_conversations_by_user_id(self, id:int):
        query = (
            Select(ConversationsModel)
            .where(ConversationsModel.userId == id)
            .order_by(asc(ConversationsModel.create_time))
        )
        return db.session.scalars(query).all()

    # 获取用户在线聊天记录的总数量
    def get_total_conversations_by_user_id(self, id:int):
        query = (
            Select(func.count(ConversationsModel.create_time))
            .where(ConversationsModel.userId == id)
        )
        total = db.session.execute(query).scalar()
        return total
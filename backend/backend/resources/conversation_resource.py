from flask_restful import Resource
from resources import api
from services.conversation_service import ConversationsService

class ConversationResource(Resource):
    # 获取指定聊天的内容
    def get(self, conversationId:int):
        conservation = ConversationsService().get_conversation_messages_by_id(conversationId=conversationId)
        return conservation.serialize_mode2()

class ConversationListResource(Resource):
    # 查询用户在线聊天的历次聊天记录
    def get(self, id:int):
        conversation_list = ConversationsService().get_conversations_by_user_id(id=id)
        if conversation_list is None:
            return {'error': 'Invalid method value'}, 412
        else:
            total = ConversationsService().get_total_conversations_by_user_id(id=id)
            return {
                'items': [conversation_model.serialize_mode1() for conversation_model in conversation_list],
                'total': str(total)
            }

api.add_resource(ConversationResource, '/conversation/conversations/<string:conversationId>')
api.add_resource(ConversationListResource, '/conversation/conversations/<string:id>$<int:limit>$<int:offset>')
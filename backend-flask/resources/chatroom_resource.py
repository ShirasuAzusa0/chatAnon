from flask_restful import Resource
from flask import request
from sqlalchemy import VARCHAR

from commons.token_check import token_required
from resources import api
from services.chatRoom_service import chatRoomService

class chatRoomResource(Resource):
    # 查询或新建聊天室
    @token_required
    def post(self):
        roleId = request.json.get('roleId', None)
        userId = request.json.get('userId', None)
        chatroom = chatRoomService().get_chatRoom_by_user_and_role(userId, roleId)
        if chatroom is None:
            chatroom = chatRoomService().set_chatRoom_by_user_and_role(userId, roleId)
            return {
                'status': 'success',
                'msg': '创建用户与某个角色的聊天室成功',
                'data': chatroom.serialize()
            }
        else:
            return {
                'status': 'success',
                'msg': '获取用户与某个角色的聊天室成功',
                'data': chatroom.serialize()
            }



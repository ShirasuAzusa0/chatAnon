from sqlalchemy import Select, select, asc, desc, func, exists, VARCHAR

from models.chatRoom_model import chatRoomModel
from resources import db

class chatRoomService:
    # 获取用户的与某个角色的聊天室
    def get_chatRoom_by_user_and_role(self, userId:int, roleId:int):
        chatroom = db.session.query(chatRoomModel).filter(
            chatRoomModel.userId == userId,
            chatRoomModel.roleId == roleId
        ).first()
        return chatroom

    # 获取角色具体内容
    def get_chatroom_by_id(self, chatRoomId: int):
        return db.session.get(chatRoomModel, chatRoomId)

    # 获取目前的角色总数量
    def get_total_chatRooms(self):
        return db.session.query(func.count(chatRoomModel.chatRoomId)).scalar()

    # 获取数据库中最后一个角色子数据
    def get_last_chatroom_id(self):
        return db.session.query(func.max(chatRoomModel.roleId)).scalar()

    # 生成聊天室编号
    def generate_chatRoomId(self):
        num = self.get_total_chatRooms()
        chatRoomId = num + 1
        if self.get_chatroom_by_id(chatRoomId):
            chatRoomId = self.get_last_chatroom_id()
            prefix, current_num = chatRoomId.split('_')
            chatRoomId = current_num + 1
        return chatRoomId

    # 创建用户的与某个角色的聊天室
    def set_chatRoom_by_user_and_role(self, userId: int, roleId: int, chatRoomName:VARCHAR):
        chatRoomId = self.generate_chatRoomId()
        new_chatroom = chatRoomModel(
            chatRoomId=chatRoomId,
            chatRoomName=chatRoomName,
            userId=userId,
            roleId=roleId
        )

        db.session.add(new_chatroom)
        db.session.commit()

        return new_chatroom
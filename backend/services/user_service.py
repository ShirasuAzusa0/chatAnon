from sqlalchemy import VARCHAR, Select, func, asc

from models.users_model import UsersModel
from resources import db
from datetime import datetime

class UsersService:
    def get_total_user(self):
        return db.session.query(func.count(UsersModel.id)).scalar()

    def generate_userId(self):
        num = self.get_total_user()
        userId = num + 1
        return userId

    def get_user_by_email(self, email:VARCHAR):
        return UsersModel.query.filter_by(email=email).first()

    def get_user_by_id(self, userId:int):
        return db.session.get(UsersModel, userId)

    def update_user_data(self, userId:int, avatarURL:VARCHAR, email:VARCHAR, userName:VARCHAR, selfDescription:VARCHAR, password:VARCHAR):
        user_model = self.get_user_by_id(userId)
        if user_model:
            updates = {
                'email': email,
                'userName': userName,
                'selfDescription': selfDescription,
                'password': password,
                'avatarURL': avatarURL
            }
            for key, value in updates.items():
                if value is None:
                    setattr(user_model, key, value)
            db.session.commit()
            return user_model

    # 注册
    def signup(self, user_model:UsersModel):
        exist_user = self.get_user_by_email(user_model.email)
        if exist_user:
            return None
        db.session.add(user_model)
        db.session.commit()
        return user_model

    # 登录
    def login(self, email:VARCHAR, password:VARCHAR):
        query = Select(UsersModel).where(UsersModel.email == email)
        user_model = db.session.scalars(query).first()
        if user_model and user_model.password == password:
            user_model.registerDate = datetime.now()
            db.session.commit()
            return user_model
        else:
            return None


    # 登出
    def logout(self, userId:int):
        user_model = self.get_user_by_id(userId)
        return user_model

    # 注销
    def logoff(self, userId:int):
        user_model = self.get_user_by_id(userId)
        db.session.delete(user_model)
        db.session.commit()
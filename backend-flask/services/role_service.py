from sqlalchemy import Select, select, asc, desc, func, exists, VARCHAR

from models.roles_model import RolesModel
from models.role_category_model import role_category
from models.role_favorite_model import role_favorites
from models.role_like_model import role_like
from models.role_history_model import role_history
from services.roleCategories_service import RoleCategoriesService
from resources import db

class RolesService:
    # 获取角色具体内容
    def get_role_by_id(self, roleId:int):
        return db.session.get(RolesModel, roleId)

    # 获取目前的角色总数量
    def get_total_roles(self):
        return db.session.query(func.count(RolesModel.roleId)).scalar()

    # 获取数据库中最后一个角色子数据
    def get_last_role_id(self):
        return db.session.query(func.max(RolesModel.roleId)).scalar()

    # 生成角色编号
    def generate_roleId(self):
        num = self.get_total_roles()
        roleId = num + 1
        if self.get_role_by_id(roleId):
            roleId = self.get_last_role_id()
            prefix, current_num = roleId.split('_')
            roleId = current_num + 1
        return roleId

    # 保存角色到数据库中
    def save_role(self, new_role: RolesModel, tags: list):
        db.session.add(new_role)
        db.session.commit()
        # 保存角色的标签分类
        for tag in tags:
            insert_stmt = role_category.insert().values(
                roleId=new_role.roleId,
                roleTagId=tag["roleTagId"]
            )
            db.session.execute(insert_stmt)
            db.session.commit()
            tag_model = RoleCategoriesService().get_tag_by_id(tag["roleTagId"])
            tag_model.lastUpdateTime = func.now()
            tag_model.rolesCount += 1
            db.session.commit()
        return new_role

    # 点赞数据处理
    def like_data_update(self, is_liked: bool, roleId:int, userId:int):
        if is_liked:
            # 删除点赞记录
            stmt = role_like.delete().where(
                (role_like.c.userId == userId) &
                (role_like.c.roleId == roleId)
            )
        else:
            # 添加点赞记录
            stmt = role_like.insert().values(
                userId=userId,
                roleId=roleId
            )
        db.session.execute(stmt)
        db.session.commit()

    # 检查是否已点赞
    def like_role_check(self, roleId:int, userId:int):
        query = db.session.query(
            exists().where(
                (role_like.c.userId == userId) &
                (role_like.c.roleId == roleId)
            )
        ).scalar()
        return query

    # 点赞角色
    def set_likes_to_role(self, is_liked:bool, roleId:int):
        role_model = self.get_role_by_id(roleId)
        if role_model:
            # 点赞
            if is_liked:
                role_model.likesCount -= 1
            # 取消点赞
            else:
                role_model.likesCount += 1
            db.session.commit()
            return role_model.likesCount
        else:
            return None

    # 处理收藏角色数据
    def favorite_data_update(self, is_favorite: bool, roleId:int, userId:int):
        if is_favorite:
            # 删除收藏记录
            stmt = role_favorites.delete().where(
                (role_favorites.c.userId == userId) &
                (role_favorites.c.roleId == roleId)
            )
        else:
            # 添加收藏记录
            stmt = role_favorites.insert().values(
                userId=userId,
                roleId=roleId
            )
        db.session.execute(stmt)
        db.session.commit()

    # 检查是否已收藏
    def favorite_role_check(self, roleId:int, userId:int):
        query = db.session.query(
            exists().where(
                (role_favorites.c.userId == userId) &
                (role_favorites.c.roleId == roleId)
            )
        ).scalar()
        return query

    # 获取用户收藏的角色
    def get_favorite_roles(self, user_id:int):
        query = (
            db.session.query(RolesModel)
            .join(role_favorites, RolesModel.roleId == role_favorites.c.roleId)
            .filter(role_favorites.c.userId == user_id)
        )
        return db.session.scalars(query).all()

    # 获取用户创建的角色列表
    def get_released_roles(self, userId:int):
        return RolesModel.query.filter_by(authorId=userId).all()

    # 获取最新角色列表
    def get_newest_roles(self):
        query = Select(RolesModel).order_by(asc(RolesModel.createdAt)).limit(3)
        return db.session.scalars(query).all()

    # 通过搜索角色名获取角色列表
    def get_roles_by_search(self, roleName:VARCHAR):
        return RolesModel.query.filter_by(roleName=roleName).all()

    # 获取历史的聊天角色列表
    def get_history_roles(self, userId:int):
        query = (
            db.session.query(RolesModel)
            .join(role_history, RolesModel.roleId == role_history.c.roleId)
            .filter(role_history.c.userId == userId)
        )
        return db.session.scalars(query).all()

    # 获取推荐角色列表
    def get_recommend_roles(self):
        # 获取当前时间的 Unix 时间戳
        current_time = func.unix_timestamp(func.now())

        # 计算时间衰减系数（除 3600 转换为小时）
        time_decay = db.cast(
            db.func.coalesce(
                current_time - func.unix_timestamp(RolesModel.likesCount),
                current_time - func.unix_timestamp(RolesModel.favoriteCount)
            ) / 3600,
            db.Float
        )

        # 综合评分公式
        popular_score = (
                (RolesModel.favoriteCount * 0.4) +
                (RolesModel.likesCount * 0.35) +
                (db.func.exp(-time_decay / 24 * db.literal(0.6931)) * 0.25)  # ln(2) ≈ 0.6931
        ).label('popular_score')

        # 构建Core查询语句，获取前3个推荐角色
        stmt = (select(RolesModel, popular_score).order_by(desc(popular_score)).limit(3))

        # 执行查询
        result = db.session.execute(stmt)
        popular_roles = result.all()

        return popular_roles
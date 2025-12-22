from sqlalchemy import Select, asc, func, exists

from models.post_favorite_model import post_favorites
from models.posts_model import PostsModel
from models.post_like_model import post_like
from models.post_category_model import post_category
from resources import db
from services.postCategories_service import CategoriesService


# 启用数据库服务的类，定义了对数据库的增、删、改、查等各类操作，并将结果返回
class PostsService:
    # 获取帖子的具体内容
    def get_post_by_id(self, postId:int):
        # 使用db.session这一与数据库交互的对象，调用get方法根据主键（primary_key）从数据库中查找单一数据记录，并将其返回
        return db.session.get(PostsModel, postId)

    # 获取目前的帖子总数量
    def get_total_posts(self):
        return db.session.query(func.count(PostsModel.postId)).scalar()

    # 获取数据库中最后一条帖子数据
    def get_last_post_id(self):
        return db.session.query(func.max(PostsModel.postId)).scalar()

    # 生成帖子编号
    def generate_postId(self):
        num = self.get_total_posts()
        postId = num + 1
        if self.get_post_by_id(postId):
            postId = self.get_last_post_id()
            prefix, current_num = postId.split('_')
            new_num = int(current_num) + 1
            postId = new_num
        return postId

    # 保存帖子到数据库中
    def save_post(self, new_post:PostsModel, tags:list):
        db.session.add(new_post)
        db.session.commit()
        # 保存帖子的标签分类
        for tag in tags:
            insert_stmt = post_category.insert().values(
                postId=new_post.postId,
                tagId=tag["tagId"]
            )
            db.session.execute(insert_stmt)
            db.session.commit()
            tag_model = CategoriesService().get_tag_by_id(tag["tagId"])
            tag_model.lastPostTime = func.now()
            tag_model.postsCount += 1
            db.session.commit()
        return new_post

    # 获取所有帖子的方法
    def get_all_posts(self):
        query = Select(PostsModel).order_by(asc(PostsModel.postId))
        return db.session.scalars(query).all()

    # 获取指定数量的帖子的方法
    def get_limited_posts(self, limit:int = 20, start:int = 0, method:int = 0):
        if method == 0:
            query = Select(PostsModel).order_by(asc(PostsModel.lastCommentedAt))
        elif method == 1:
            query = Select(PostsModel).order_by(asc(PostsModel.likesCount))
        elif method == 2:
            query = Select(PostsModel).order_by(asc(PostsModel.createdAt))
        else:
            return None

        if limit is not None:
            query = query.limit(limit).offset(start)
        return db.session.scalars(query).all()

    # 评论数据处理
    def set_comment_count(self, post_id:int, user_id:int):
        post_model = self.get_post_by_id(post_id)
        post_model.commentsCount += 1
        post_model.lastCommentedAt = func.now()
        post_model.lastCommentedUserId = user_id
        db.session.commit()
        return True

    # 点赞数据处理
    def like_data_update(self, is_liked:bool, user_id:int, post_id:int):
        if is_liked:
            # 删除点赞记录
            stmt = post_like.delete().where(
                (post_like.c.userId == user_id) &
                (post_like.c.postId == post_id)
            )
        else:
            # 添加点赞记录
            stmt = post_like.insert().values(
                userId=user_id,
                postId=post_id
            )
        db.session.execute(stmt)
        db.session.commit()

    # 检查是否已点赞
    def like_status_check(self, post_id:int, user_id:int):
        query = db.session.query(
            exists().where(
                (post_like.c.userId == user_id) &
                (post_like.c.postId == post_id)
            )
        ).scalar()
        return query

    # 点赞帖子
    def set_likes_to_post(self, is_liked:bool, postId:int):
        post_model = self.get_post_by_id(postId)
        if post_model:
            # 点赞
            if is_liked:
                post_model.likesCount -= 1
            # 取消点赞
            else:
                post_model.likesCount += 1
            db.session.commit()
            return post_model.likesCount
        else:
            return None

    # 处理收藏帖子数据
    def favorite_data_update(self, is_favorite:bool, post_id:int, user_id:int):
        if is_favorite:
            # 删除收藏记录
            stmt = post_favorites.delete().where(
                (post_favorites.c.userId == user_id) &
                (post_favorites.c.postId == post_id)
            )
        else:
            # 添加收藏记录
            stmt = post_favorites.insert().values(
                userId=user_id,
                postId=post_id
            )
        db.session.execute(stmt)
        db.session.commit()

    # 检查是否已收藏
    def favorite_post_check(self, postId:int, userId:int,):
        query = db.session.query(
            exists().where(
                (post_favorites.c.userId == userId) &
                (post_favorites.c.postId == postId)
            )
        ).scalar()
        return query

    # 获取用户收藏的帖子
    def get_favorite_posts(self, user_id:int):
        query = (
            db.session.query(PostsModel)
            .join(post_favorites, PostsModel.postId == post_favorites.c.postId)
            .filter(post_favorites.c.userId == user_id)
        )
        return query.all()

    # 获取用户发布的帖子
    def get_released_posts(self, user_id:int):
        return PostsModel.query.filter_by(authorId=user_id).all()


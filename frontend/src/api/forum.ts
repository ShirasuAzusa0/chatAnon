import { get, post, put } from '@/lib/apiClient';
import type {
  FetchPostMethod,
  ForumTag,
  LikeType,
  Post,
  PostWithLastCommentUser,
} from '@/types/forum.type';

/**
 * 获取论坛帖子列表
 */
export const fetchForumPostList = async (
  limit: number,
  offset: number,
  method: FetchPostMethod = 0
) => {
  return await get<PostWithLastCommentUser[]>('/api/forum/posts', { limit, offset, method });
};

/**
 * 获取指定标签对应的帖子列表
 * @param tag 标签名称
 */
export const fetchForumPostListByTag = async (tag: string) => {
  return await get<PostWithLastCommentUser[]>(`/api/forum/${tag}/posts`);
};

/**
 * 获取帖子标签列表
 */
export const fetchForumTagList = async () => {
  return await get<ForumTag[]>('/api/forum/tags');
};

/**
 * 获取具体帖子内容
 * @param postId 帖子ID
 * @param userId 用户ID
 */
export const fetchForumPostDetail = async (postId: number, userId: number) => {
  return await get<Post>(`/api/forum/post/${postId}`, { userId });
};

interface CreateForumPostRequest {
  userId: number;
  title: string;
  content: string;
  tags: Pick<ForumTag, 'tagId' | 'tagName'>[];
}

/**
 * 发表帖子
 * @param req 发表帖子请求
 */
export const createForumPost = async (req: CreateForumPostRequest) => {
  const { userId, ...rest } = req;
  return await post<{ postId: number; title: string }>('/api/forum/newpost', rest, {
    params: { userId },
  });
};

interface CreateNewCommentRequest {
  userId: number;
  postId: number;
  content: string;
}

/**
 * 发布新评论
 */
export const createNewComment = async (req: CreateNewCommentRequest) => {
  const { userId, postId, ...rest } = req;
  return await post<{ postId: number; commentId: number }>('/api/forum/newcomment', rest, {
    params: { userId, postId },
  });
};

/**
 * 回复评论
 */
interface ReplyCommentRequest extends CreateNewCommentRequest {
  replyId: number;
}

export const replyComment = async (req: ReplyCommentRequest) => {
  const { userId, ...rest } = req;
  return await post<{ postId: number; commentId: number; replyId: number }>(
    '/api/forum/replycomment',
    rest,
    { params: { userId } }
  );
};

/**
 * 点赞帖子/评论
 */
interface LikePostRequest {
  type: LikeType;
  userId: number;
  likeId: number;
}

export const likePost = async (req: LikePostRequest) => {
  const { type, userId, likeId } = req;
  return await put<{ isLiked: boolean; likeId: number }>(
    `/api/forum/${type}/like`,
    {},
    { params: { userId, likeId } }
  );
};

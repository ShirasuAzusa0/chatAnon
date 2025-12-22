export interface ForumTag {
  tagId: number;
  tagName: string;
  hueColor: string; // 标签颜色
  counts: number; // 标签下的内容数目
  lastUpdatedTime: string; // 最后更新时间
}

export type LikeType = 'post' | 'comment';

/**
 * 获取帖子的方式
 * 最新回复 `0`
 * 最热门 `1`
 * 最新发布 `2`
 */
export type FetchPostMethod = 0 | 1 | 2;

export interface PostAuthor {
  id: number;
  attributes: {
    avatarUrl: string;
    userName: string;
    email: string;
  };
}

export interface PostComment {
  commentId: number;
  author: PostAuthor;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  repliedId: number;
}

export interface Post {
  postId: number;
  title: string;
  author: PostAuthor;
  tags: ForumTag[];
  createdAt: string;
  lastCommentedAt: string;
  commentsCount: number;
  likesCount: number;
  content: string;
  comments: PostComment[];
}

export interface PostWithLastCommentUser extends Post {
  lastCommentedUser: {
    id: number;
    userName: string;
  };
}

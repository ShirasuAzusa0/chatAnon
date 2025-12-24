import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FetchPostMethod,
  ForumTag,
  Post,
  PostComment,
  PostWithLastCommentUser,
} from '@/types/forum.type';
import {
  fetchForumPostList,
  fetchForumPostListByTag,
  fetchForumTagList,
  fetchForumPostDetail,
  likePost,
  createNewComment,
  replyComment,
} from '@/api/forum';
import { useUserStore } from '@/stores/userStore';

export interface UseForumPageResult {
  tags: ForumTag[];
  activeTag: ForumTag | null;
  method: FetchPostMethod;
  posts: PostWithLastCommentUser[];
  isLoading: boolean;
  isLikingId: number | null;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setMethod: (method: FetchPostMethod) => void;
  selectTag: (tag: ForumTag | null) => void;
  toggleLike: (postId: number) => Promise<void>;
}

const PAGE_LIMIT = 10;

export const useForumPage = (): UseForumPageResult => {
  const { user, isLoggedIn } = useUserStore();
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [activeTag, setActiveTag] = useState<ForumTag | null>(null);
  const [method, setMethodState] = useState<FetchPostMethod>(0);
  const [posts, setPosts] = useState<PostWithLastCommentUser[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const isLoadingRef = useRef<boolean>(false);
  const [isLikingId, setIsLikingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    try {
      const data = await fetchForumTagList();
      setTags(data);
    } catch (err) {
      console.error('获取标签失败', err);
    }
  }, []);

  const loadPosts = useCallback(
    async (reset: boolean) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setError(null);
      try {
        const nextOffset = reset ? 0 : offset;
        let data: PostWithLastCommentUser[];
        if (activeTag) {
          data = await fetchForumPostListByTag(activeTag.tagName);
        } else {
          data = await fetchForumPostList(PAGE_LIMIT, nextOffset, method);
        }
        setPosts((prev) => (reset ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_LIMIT && !activeTag);
        setOffset(nextOffset + PAGE_LIMIT);
      } catch (err) {
        console.error('获取帖子列表失败', err);
        setError('获取帖子列表失败，请稍后重试');
      } finally {
        isLoadingRef.current = false;
      }
    },
    [activeTag, method, offset]
  );

  const refresh = useCallback(() => {
    void loadPosts(true);
  }, [loadPosts]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current || activeTag) return;
    void loadPosts(false);
  }, [activeTag, hasMore, loadPosts]);

  const selectTag = useCallback(
    (tag: ForumTag | null) => {
      setActiveTag(tag);
      setOffset(0);
      setHasMore(true);
      setPosts([]);
      void loadPosts(true);
    },
    [loadPosts]
  );

  const setMethod = useCallback(
    (nextMethod: FetchPostMethod) => {
      setMethodState(nextMethod);
      setOffset(0);
      setHasMore(true);
      setPosts([]);
      void loadPosts(true);
    },
    [loadPosts]
  );

  const toggleLike = useCallback(
    async (postId: number) => {
      if (!isLoggedIn || !user) {
        setError('请先登录后再点赞');
        return;
      }
      const target = posts.find((item) => item.postId === postId);
      if (!target) return;
      try {
        setIsLikingId(postId);
        const res = await likePost({
          type: 'post',
          userId: Number(user.userId),
          likeId: postId,
        });
        setPosts((prev) =>
          prev.map((item) =>
            item.postId === postId
              ? {
                ...item,
                likesCount: res.liked ? item.likesCount + 1 : item.likesCount - 1,
              }
              : item
          )
        );
      } catch (err) {
        console.error('点赞失败', err);
        setError('点赞失败，请稍后重试');
      } finally {
        setIsLikingId(null);
      }
    },
    [isLoggedIn, posts, user]
  );

  useEffect(() => {
    void loadTags();
    void loadPosts(true);
  }, [loadPosts, loadTags]);

  return {
    tags,
    activeTag,
    method,
    posts,
    isLoading: isLoadingRef.current,
    isLikingId,
    error,
    hasMore,
    loadMore,
    refresh,
    setMethod,
    selectTag,
    toggleLike,
  };
};

export interface UseForumPostPageResult {
  post: Post | null;
  isLoading: boolean;
  isLikingId: number | null;
  submitting: boolean;
  error: string | null;
  loadPost: () => void;
  toggleLike: (postId: number) => Promise<void>;
  submitComment: (content: string) => Promise<void>;
  submitReply: (commentId: number, content: string) => Promise<void>;
}

export const useForumPostPage = (postId: number | null): UseForumPostPageResult => {
  const { user, isLoggedIn } = useUserStore();
  const [post, setPost] = useState<Post | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const [isLikingId, setIsLikingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    isLoadingRef.current = true;
    setError(null);
    try {
      const userId = user ? Number(user.userId) : 0;
      const data = await fetchForumPostDetail(postId, userId);
      setPost(data);
    } catch (err) {
      console.error('获取帖子详情失败', err);
      setError('获取帖子详情失败，请稍后重试');
    } finally {
      isLoadingRef.current = false;
    }
  }, [postId, user]);

  const toggleLike = useCallback(
    async (likeId: number) => {
      if (!isLoggedIn || !user) {
        setError('请先登录后再点赞');
        return;
      }
      try {
        setIsLikingId(likeId);
        const res = await likePost({
          type: 'post',
          userId: Number(user.userId),
          likeId,
        });
        setPost((prev) =>
          prev
            ? {
              ...prev,
              liked: res.liked,
              likesCount: res.liked ? prev.likesCount + 1 : prev.likesCount - 1,
            }
            : prev
        );
      } catch (err) {
        console.error('点赞失败', err);
        setError('点赞失败，请稍后重试');
      } finally {
        setIsLikingId(null);
      }
    },
    [isLoggedIn, user]
  );

  const submitComment = useCallback(
    async (content: string) => {
      if (!postId || !isLoggedIn || !user) {
        setError('请先登录后再发表评论');
        return;
      }
      if (!content.trim()) {
        setError('评论内容不能为空');
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        const res = await createNewComment({
          userId: Number(user.userId),
          postId,
          content,
        });
        const newComment: PostComment = {
          commentId: res.commentId,
          author: {
            id: Number(user.userId),
            attributes: {
              avatarUrl: user.avatar,
              userName: user.userName,
              email: user.email,
            },
          },
          content,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          isLiked: false,
          repliedId: 0,
        };
        setPost((prev) =>
          prev
            ? {
              ...prev,
              comments: [...prev.comments, newComment],
              commentsCount: prev.commentsCount + 1,
            }
            : prev
        );
      } catch (err) {
        console.error('发表评论失败', err);
        setError('发表评论失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [isLoggedIn, postId, user]
  );

  const submitReply = useCallback(
    async (commentId: number, content: string) => {
      if (!postId || !isLoggedIn || !user) {
        setError('请先登录后再回复');
        return;
      }
      if (!content.trim()) {
        setError('回复内容不能为空');
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        await replyComment({
          userId: Number(user.userId),
          postId,
          content,
          replyId: commentId,
        });
        await loadPost();
      } catch (err) {
        console.error('回复失败', err);
        setError('回复失败，请稍后重试');
      } finally {
        setSubmitting(false);
      }
    },
    [isLoggedIn, loadPost, postId, user]
  );

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  return {
    post,
    isLoading: isLoadingRef.current,
    isLikingId,
    submitting,
    error,
    loadPost,
    toggleLike,
    submitComment,
    submitReply,
  };
};

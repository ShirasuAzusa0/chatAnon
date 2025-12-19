import { MessagesSquare, ThumbsUp, MessageCircle, RefreshCw } from 'lucide-react';
import { useForumPage } from '@/hooks/useForumPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router';

const methodOptions = [
  { label: '最新回复', value: 0 as const },
  { label: '最热门', value: 1 as const },
  { label: '最新发布', value: 2 as const },
];

function ForumPage() {
  const navigate = useNavigate();
  const {
    tags,
    activeTag,
    method,
    posts,
    isLoading,
    isLikingId,
    error,
    hasMore,
    loadMore,
    refresh,
    setMethod,
    selectTag,
    toggleLike,
  } = useForumPage();

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-md">
            <MessagesSquare className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">社区论坛</h1>
            <p className="text-muted-foreground text-sm">和其他用户一起讨论、分享你的想法</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      <section className="bg-background/50 flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={activeTag === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => selectTag(null)}
            >
              全部
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag.tagId}
                style={{
                  backgroundColor: activeTag?.tagId === tag.tagId ? tag.hueColor : undefined,
                }}
                variant={activeTag?.tagId === tag.tagId ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => selectTag(tag)}
              >
                {tag.tagName}
                <span className="ml-1 text-xs opacity-80">{tag.counts}</span>
              </Badge>
            ))}
          </div>
          <Tabs
            value={String(method)}
            onValueChange={(val) => setMethod(Number(val) as 0 | 1 | 2)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              {methodOptions.map((opt) => (
                <TabsTrigger key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="flex-1 space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {posts.length === 0 && !isLoading ? (
          <div className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center text-center text-sm">
            <p>暂无帖子</p>
            <p>快去成为第一个发帖的人吧～</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card
                key={post.postId}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/forum/${post.postId}`)}
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base sm:text-lg">
                      {post.title}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span>作者：{post.author.attributes.userName}</span>
                      <span>·</span>
                      <span>评论：{post.commentsCount}</span>
                      <span>·</span>
                      <span>最后回复：{post.lastCommentedUser?.userName}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.tagId} variant="outline">
                        {tag.tagName}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>发布于：{new Date(post.createdAt).toLocaleString()}</span>
                    <span>最后评论：{new Date(post.lastCommentedAt).toLocaleString()}</span>
                  </div>
                  <div
                    className="flex items-center gap-3"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs disabled:opacity-60"
                      onClick={() => {
                        void toggleLike(post.postId);
                      }}
                      disabled={isLikingId === post.postId}
                    >
                      <ThumbsUp
                        className={`h-4 w-4 ${isLikingId === post.postId ? 'animate-pulse' : ''}`}
                      />
                      <span>{post.likesCount}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.commentsCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-center py-4">
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={isLoading}>
              {isLoading ? '加载中...' : '加载更多'}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default ForumPage;

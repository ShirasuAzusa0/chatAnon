import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { ArrowLeft, MessageCircle, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useForumPostPage } from '@/hooks/useForumPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/userStore';
import CommentPanel from '@/components/forum/CommentPanel';
import { formatTime } from '@/lib/date';
import dayjs from 'dayjs';

function ForumPostPage() {
  const { postId } = useParams();
  const numericPostId = useMemo(() => (postId ? Number(postId) : null), [postId]);
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState<string>('');
  const [replyForId, setReplyForId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');

  const { post, isLoading, isLikingId, submitting, error, toggleLike, submitComment, submitReply } =
    useForumPostPage(numericPostId);

  const { isLoggedIn } = useUserStore();

  if (error) {
    toast.error(error);
  }

  const handleSubmitComment = async () => {
    await submitComment(commentContent);
    setCommentContent('');
  };

  const handleSubmitReply = async () => {
    if (!replyForId) return;
    await submitReply(replyForId, replyContent);
    setReplyContent('');
    setReplyForId(null);
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft />
          返回论坛
        </Button>
      </header>

      {isLoading && !post ? (
        <div className="text-muted-foreground flex min-h-50 flex-col items-center justify-center text-sm">
          正在加载帖子内容...
        </div>
      ) : !post ? (
        <div className="text-muted-foreground flex min-h-50 flex-col items-center justify-center text-sm">
          未找到帖子内容
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-2xl">{post.title}</CardTitle>
                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={post.author.attributes.avatarUrl} />
                        <AvatarFallback>
                          {post.author.attributes.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author.attributes.userName}</span>
                    </div>
                    <span>·</span>
                    <span>发布于：{formatTime(dayjs(post.createdAt), true)}</span>
                    <span>·</span>
                    <span>评论：{post.commentsCount}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.tagId} variant="outline">
                        {tag.tagName}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant={post.liked ? 'default' : 'outline'}
                    size="sm"
                    className="mt-1 flex items-center gap-1"
                    onClick={() => {
                      if (numericPostId !== null) {
                        toggleLike(numericPostId);
                      }
                    }}
                    disabled={isLikingId === post.postId}
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${isLikingId === post.postId ? 'animate-pulse' : ''}`}
                    />
                    <span>{post.likesCount}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 border-t pt-4 text-sm leading-relaxed">
              <p className="wrap-break-word whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>

          {/* 评论列表 */}
          <CommentPanel
            comments={post.comments ?? []}
            commentsCount={post.commentsCount}
            replyForId={replyForId}
            replyContent={replyContent}
            submitting={submitting}
            onReplyClick={(commentId) => {
              setReplyForId(commentId);
              setReplyContent('');
            }}
            onReplyContentChange={(value) => setReplyContent(value)}
            onCancelReply={() => {
              setReplyForId(null);
              setReplyContent('');
            }}
            onSubmitReply={() => {
              void handleSubmitReply();
            }}
          />

          {/* 发表评论 */}
          <section className="bg-background space-y-4 rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              <span>{isLoggedIn ? '发表评论' : '登录后发表评论'}</span>
            </div>
            <Textarea
              placeholder="说点什么..."
              value={commentContent}
              disabled={!isLoggedIn || submitting}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  void handleSubmitComment();
                }}
                disabled={submitting || !commentContent.trim()}
              >
                {submitting ? '发送中...' : '发表评论'}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ForumPostPage;

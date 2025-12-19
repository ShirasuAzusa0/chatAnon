import type { PostComment } from '@/types/forum.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageCircle } from 'lucide-react';

interface CommentItemProps {
  comment: PostComment;
  replyForId: number | null;
  replyContent: string;
  submitting: boolean;
  onReplyClick: (commentId: number) => void;
  onReplyContentChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
}

function CommentItem({
  comment,
  replyForId,
  replyContent,
  submitting,
  onReplyClick,
  onReplyContentChange,
  onCancelReply,
  onSubmitReply,
}: CommentItemProps) {
  return (
    <div className="bg-muted/40 flex gap-3 rounded-md p-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.attributes.avatarUrl} />
        <AvatarFallback>
          {comment.author.attributes.userName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{comment.author.attributes.userName}</span>
          <span className="text-muted-foreground text-xs">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="break-words whitespace-pre-wrap">{comment.content}</p>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          <button
            type="button"
            className="hover:text-primary"
            onClick={() => {
              onReplyClick(comment.commentId);
            }}
          >
            回复
          </button>
        </div>
        {replyForId === comment.commentId && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder={`回复 ${comment.author.attributes.userName}...`}
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCancelReply();
                }}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onSubmitReply();
                }}
                disabled={submitting || !replyContent.trim()}
              >
                {submitting ? '发送中...' : '发送回复'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentPanelProps {
  comments: PostComment[];
  commentsCount: number;
  replyForId: number | null;
  replyContent: string;
  submitting: boolean;
  onReplyClick: (commentId: number) => void;
  onReplyContentChange: (value: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
}

function CommentPanel({
  comments,
  commentsCount,
  replyForId,
  replyContent,
  submitting,
  onReplyClick,
  onReplyContentChange,
  onCancelReply,
  onSubmitReply,
}: CommentPanelProps) {
  return (
    <section className="bg-background space-y-4 rounded-xl border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4" />
        <span>全部评论 ({commentsCount})</span>
      </div>
      <Separator />
      {comments.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-xs">还没有评论，快来抢沙发～</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              replyForId={replyForId}
              replyContent={replyContent}
              submitting={submitting}
              onReplyClick={onReplyClick}
              onReplyContentChange={onReplyContentChange}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CommentPanel;

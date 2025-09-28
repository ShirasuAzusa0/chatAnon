import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/stores/userStore';
import RoleDetailPanel, { type UserDetail } from '@/components/RoleDetailPanel';
import {
  fetchChatMessages,
  sendMessage,
  receiveMessageResponse,
  type ChatMessage,
} from '@/api/chat';
import { fetchRoleDetail, type RoleDetailInfo } from '@/api/roles';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: number;
};

type ChatTarget = {
  userId: string;
  name: string;
  bio: string;
  avatar: string;
};

type LoadingState = {
  messages: boolean;
  roleDetail: boolean;
  sending: boolean;
  waiting: boolean; // 等待对方回复的状态
};

function ChatPage() {
  const { chatId } = useParams();
  const currentUser = useUserStore((s) => s.user);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [roleDetail, setRoleDetail] = useState<RoleDetailInfo | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    messages: false,
    roleDetail: false,
    sending: false,
    waiting: false,
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  // 根据 chatId 获取聊天对象信息
  const target: ChatTarget = useMemo(() => {
    const fallbackId = chatId ?? 'unknown';
    return {
      userId: fallbackId,
      name: roleDetail?.roleName ?? `用户 ${fallbackId}`,
      bio: roleDetail?.description ?? '这个人很神秘，什么也没有留下。',
      avatar: roleDetail?.avatarURL ?? '/icon.png',
    };
  }, [chatId, roleDetail]);

  const targetDetail: UserDetail = useMemo(
    () => ({
      userId: target.userId,
      name: target.name,
      avatarLarge: roleDetail?.avatarURL ?? '',
      tags: [],
      bio: target?.bio,
    }),
    [target, roleDetail]
  );

  // 获取聊天记录
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!chatId) return;

      setLoading((prev) => ({ ...prev, messages: true }));
      try {
        const chatMessages = await fetchChatMessages(Number(chatId));
        const formattedMessages: Message[] = chatMessages.map((msg: ChatMessage) => ({
          id: msg.id.toString(),
          senderId: msg.role === 'user' ? (currentUser?.userId ?? 'me') : 'assistant',
          content: msg.content,
          createdAt: new Date(msg.time).getTime(),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('获取聊天记录失败:', error);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    };

    loadChatMessages();
  }, [chatId, currentUser?.userId]);

  // 获取角色详情
  useEffect(() => {
    const loadRoleDetail = async () => {
      if (!chatId) return;

      setLoading((prev) => ({ ...prev, roleDetail: true }));
      try {
        const detail = await fetchRoleDetail(Number(chatId));
        setRoleDetail(detail);
      } catch (error) {
        console.error('获取角色详情失败:', error);
      } finally {
        setLoading((prev) => ({ ...prev, roleDetail: false }));
      }
    };

    loadRoleDetail();
  }, [chatId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const trimmedMsg = inputValue.trim();
    if (!trimmedMsg || !chatId || loading.sending || loading.waiting) return;

    setLoading((prev) => ({ ...prev, sending: true }));

    // 立即显示用户消息
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser?.userId ?? 'me',
      content: trimmedMsg,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputValue('');

    try {
      // 发送用户消息
      const response = await sendMessage(
        Number(chatId),
        'user',
        new Date().toISOString(),
        trimmedMsg
      );

      // 替换临时消息为真实消息
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMsg.id
            ? {
                id: response.id.toString(),
                senderId: currentUser?.userId ?? 'me',
                content: response.content,
                createdAt: new Date(response.time).getTime(),
              }
            : msg
        )
      );

      // 设置等待对方回复状态
      setLoading((prev) => ({ ...prev, sending: false, waiting: true }));

      try {
        // 调用接收消息API
        const assistantResponse = await receiveMessageResponse(Number(chatId), response.id);

        // 添加对方回复消息
        const assistantMsg: Message = {
          id: assistantResponse.id.toString(),
          senderId: 'assistant',
          content: assistantResponse.content,
          createdAt: new Date(assistantResponse.time).getTime(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error('接收对方回复失败:', error);
        toast.error('消息接收失败！');
      } finally {
        // 无论是否成功接收到回复，都重置等待状态
        setLoading((prev) => ({ ...prev, waiting: false }));
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 移除临时消息
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMsg.id));
      // 恢复输入内容
      setInputValue(trimmedMsg);
      setLoading((prev) => ({ ...prev, sending: false, waiting: false }));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col md:h-[calc(100dvh-20px)]">
      {/* 顶部：聊天对象信息 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={target.avatar} alt={target.name} />
            <AvatarFallback>{target.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{target.name}</div>
            <div className="text-muted-foreground max-w-lg truncate text-xs">{target.bio}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowDetail((v) => !v)}>
          {showDetail ? '收起资料' : '查看资料'}
        </Button>
      </div>
      <Separator />

      {/* 主体：左侧消息区 + 右侧资料面板 */}
      <div className="flex min-h-0 flex-1">
        {/* 左侧：消息列表 + 输入 */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 中部：消息列表 */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {loading.messages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <div className="text-muted-foreground text-sm">加载聊天记录中...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground text-sm">暂无聊天记录</div>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.senderId === (currentUser?.userId ?? 'me');
                return (
                  <div
                    key={message.id}
                    className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={
                        'max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-xs ' +
                        (isMe
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-accent text-accent-foreground rounded-bl-none')
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部：输入与发送 */}
          <div className="border-t px-3 py-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder={loading.waiting ? '等待对方回复中...' : `发消息给 ${target.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading.sending || loading.waiting}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading.sending || loading.waiting}
              >
                {loading.sending && <Loader2 className="animate-spin" />}
                {loading.waiting && <Loader2 className="animate-spin" />}
                {loading.sending ? '发送中...' : loading.waiting ? '等待回复...' : '发送'}
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧：用户详情面板 */}
        {showDetail && (
          <div className="w-full max-w-[360px] border-l">
            {loading.roleDetail ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground text-sm">加载角色详情中...</div>
              </div>
            ) : (
              <RoleDetailPanel user={targetDetail} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;

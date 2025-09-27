import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/stores/userStore';
import RoleDetailPanel, { type UserDetail } from '@/components/RoleDetailPanel';

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

function ChatPage() {
  const { chatId } = useParams();
  const currentUser = useUserStore((s) => s.user);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  // 模拟根据 chatId 获取聊天对象信息（实际应由 ViewModel/接口提供）
  const target: ChatTarget = useMemo(() => {
    const fallbackId = chatId ?? 'unknown';
    return {
      userId: fallbackId,
      name: `用户 ${fallbackId}`,
      bio: '这个人很神秘，什么也没有留下。',
      avatar: '/icon.png',
    };
  }, [chatId]);

  const targetDetail: UserDetail = useMemo(
    () => ({
      userId: target.userId,
      name: target.name,
      avatarLarge: '/home-bg.png',
      tags: ['匿名', '兴趣广泛', '活跃'],
      bio: `${target.bio}\n\n她正在使用 chatAnon 与你交流。`,
    }),
    [target]
  );

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm1',
      senderId: target.userId,
      content: '你好～很高兴认识你！',
      createdAt: Date.now() - 1000 * 60 * 5,
    },
    {
      id: 'm2',
      senderId: currentUser?.userId ?? 'me',
      content: '嗨，咱们开始聊天吧。',
      createdAt: Date.now() - 1000 * 60 * 4,
    },
    {
      id: 'm1',
      senderId: target.userId,
      content: '你好～很高兴认识你！',
      createdAt: Date.now() - 1000 * 60 * 5,
    },
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newMsg: Message = {
      id: `${Date.now()}`,
      senderId: currentUser?.userId ?? 'me',
      content: trimmed,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
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
            <div className="text-muted-foreground truncate text-xs">{target.bio}</div>
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
            {messages.map((message) => {
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
            })}
          </div>

          {/* 底部：输入与发送 */}
          <div className="border-t px-3 py-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`发消息给 ${target.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button onClick={handleSend} disabled={!inputValue.trim()}>
                发送
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧：用户详情面板 */}
        {showDetail ? <RoleDetailPanel user={targetDetail} /> : null}
      </div>
    </div>
  );
}

export default ChatPage;

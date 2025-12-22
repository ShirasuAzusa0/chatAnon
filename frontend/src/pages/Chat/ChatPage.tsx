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
  sendMessageStream,
  type ChatMessage,
  type StreamResponse,
} from '@/api/chat';
import { fetchRoleDetail, type RoleDetailInfo } from '@/api/roles';
import { toast } from 'sonner';
import { Loader2, Mic, MicOff } from 'lucide-react';
import useXunfeiASR from '@/hooks/useXunfeiASR';

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
  const { chatId, roleId } = useParams();
  const currentUser = useUserStore((s) => s.user);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [roleDetail, setRoleDetail] = useState<RoleDetailInfo | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    messages: false,
    roleDetail: false,
    sending: false,
    waiting: false,
  });
  const listRef = useRef<HTMLDivElement | null>(null);

  // 使用讯飞实时语音转写 Hook
  const { isRecording, text, interimText, startRecording, stopRecording } = useXunfeiASR({
    lang: 'cn', // 中文
  });

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
        setMessages(chatMessages);
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
      if (!roleId) return;

      setLoading((prev) => ({ ...prev, roleDetail: true }));
      try {
        const detail = await fetchRoleDetail(Number(roleId));
        setRoleDetail(detail);
      } catch (error) {
        console.error('获取角色详情失败:', error);
      } finally {
        setLoading((prev) => ({ ...prev, roleDetail: false }));
      }
    };

    loadRoleDetail();
  }, [roleId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const trimmedMsg = inputValue.trim();
    if (!trimmedMsg || !chatId || loading.sending || loading.waiting) return;

    setLoading((prev) => ({ ...prev, sending: true }));

    // 立即显示用户消息
    // 使用 Date.now() 作为临时 ID
    const tempUserMsgId = Date.now();
    const tempUserMsg: ChatMessage = {
      messageId: tempUserMsgId,
      role: 'user',
      content: trimmedMsg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputValue('');

    try {
      // 发送用户消息并获取流式响应
      const response = await sendMessageStream(Number(chatId), trimmedMsg);

      // 准备接收 AI 回复
      // 这里的 ID 也是临时的，实际场景中可能需要后端返回 ID 或完全依赖前端 ID
      const assistantMsgId = tempUserMsgId + 1;
      const assistantMsg: ChatMessage = {
        messageId: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading((prev) => ({ ...prev, sending: false, waiting: true }));

      // 处理流式响应
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // 用于处理分包/粘包

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 按行分割处理
          const lines = buffer.split('\n');
          // 最后一行可能不完整，留到下一次处理
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

            const data = trimmedLine.slice(5).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed: StreamResponse = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const index = newMessages.findIndex((m) => m.messageId === assistantMsgId);
                  if (index !== -1) {
                    newMessages[index] = {
                      ...newMessages[index],
                      content: newMessages[index].content + content,
                    };
                  }
                  return newMessages;
                });

                // 收到第一个有效内容后，就不再是 waiting 状态了
                setLoading((prev) => ({ ...prev, waiting: false }));
              }
            } catch (e) {
              console.error('解析流式数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 移除临时消息
      setMessages((prev) => prev.filter((msg) => msg.messageId !== tempUserMsgId));
      // 恢复输入内容
      setInputValue(trimmedMsg);
      toast.error('发送失败，请重试');
    } finally {
      setLoading((prev) => ({ ...prev, sending: false, waiting: false }));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 监听语音识别结果，更新输入框
  useEffect(() => {
    if (text) {
      setInputValue((prev) => {
        // 移除之前可能存在的中间结果标记
        const baseInput = prev.replace(/\[识别中...\].*$/, '');
        return baseInput + text;
      });
    }
  }, [text]);

  // 监听中间结果，更新输入框
  useEffect(() => {
    if (interimText) {
      setInputValue((prev) => {
        // 移除之前可能存在的中间结果标记
        const baseInput = prev.replace(/\[识别中...\].*$/, '');
        return baseInput + '[识别中...] ' + interimText;
      });
    }
  }, [interimText]);

  return (
    <div className="flex h-dvh flex-col md:h-[calc(100dvh-20px)]">
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
                const isMe = message.role === 'user';
                return (
                  <div
                    key={message.messageId}
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
                disabled={loading.sending || loading.waiting || isRecording}
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={isRecording ? stopRecording : () => startRecording(true)}
                disabled={loading.sending || loading.waiting}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading.sending || loading.waiting || isRecording}
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
          <div className="w-full max-w-90 border-l">
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

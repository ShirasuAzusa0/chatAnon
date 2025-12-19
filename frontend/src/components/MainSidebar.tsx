import { Home, Star, BookUser, ChevronDown, Loader2, MessagesSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchChatHistoryList, type ChatSession } from '@/api/chat';
import { useUserStore } from '@/stores/userStore';
import dayjs from 'dayjs';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from 'react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UserInfo } from '@/components/UserInfo.tsx';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { formatTime } from '@/lib/date';

// Menu items.
const items = [
  {
    title: '首页',
    url: '/',
    icon: Home,
  },
  {
    title: '论坛',
    url: '/forum',
    icon: MessagesSquare,
  },
  {
    title: '收藏角色',
    url: '/favorite-role',
    icon: Star,
  },
  {
    title: '历史聊天角色',
    url: '/my-role',
    icon: BookUser,
  },
];

export function MainSidebar() {
  // 获取用户登录状态
  const { isLoggedIn } = useUserStore();

  // 添加聊天历史状态
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取聊天历史数据
  useEffect(() => {
    // 只有在用户已登录时才获取聊天历史
    if (!isLoggedIn) {
      setChatHistory([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchChatHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchChatHistoryList();
        // 按照lastUpdatedAt排序，最新的在最上面
        const sortedData = [...data].sort(
          (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
        );
        setChatHistory(sortedData);
      } catch (err) {
        console.error('获取聊天历史失败:', err);
        setError('获取聊天历史失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [isLoggedIn]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* 侧边栏顶部 */}
      <SidebarHeader className="group/header relative">
        <div className="flex items-center justify-between">
          <Link className="group-data-[state=collapsed]:group-hover/header:opacity-0" to="/">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 overflow-hidden rounded-md">
                <img className="h-full object-cover" src="/icon.png" alt="icon" />
              </div>
              <span className="absolute left-20 w-30 text-lg font-bold select-none group-data-[state=collapsed]:opacity-0">
                Anon Chat
              </span>
            </div>
          </Link>
          <SidebarTrigger className="group-data-[state=collapsed]:absolute group-data-[state=collapsed]:top-1/2 group-data-[state=collapsed]:right-2 group-data-[state=collapsed]:z-10 group-data-[state=collapsed]:-translate-y-1/2 group-data-[state=collapsed]:p-4.5 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:group-hover/header:opacity-100" />
        </div>
      </SidebarHeader>
      {/* 侧边栏主要部分 */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* 聊天历史 */}
        <Collapsible defaultOpen className="group/collapsible group-data-[state=collapsed]:hidden">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                聊天历史
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {!isLoggedIn ? (
                    <div className="text-muted-foreground py-2 text-center text-sm">
                      登录以查看聊天历史
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  ) : error ? (
                    <div className="py-2 text-center text-sm text-red-500">{error}</div>
                  ) : chatHistory.length === 0 ? (
                    <div className="text-muted-foreground py-2 text-center text-sm">
                      暂无聊天历史
                    </div>
                  ) : (
                    chatHistory.map((chatItem) => (
                      <SidebarMenuItem key={chatItem.sessionId}>
                        <SidebarMenuButton asChild>
                          <Link to={`/chat/${chatItem.sessionId}`}>
                            <span>{chatItem.sessionName}</span>
                            <span className="text-muted-foreground ml-auto text-xs">
                              {formatTime(dayjs(chatItem.lastUpdatedAt))}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      {/* 侧边栏底部 */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <UserInfo />
              <div className="group-data-[state=collapsed]:hidden">
                <ModeToggle />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

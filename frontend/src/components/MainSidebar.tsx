import { Home, Star, BookUser, ChevronDown } from 'lucide-react';

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

// Menu items.
const items = [
  {
    title: '首页',
    url: '/',
    icon: Home,
  },
  // {
  //   title: '论坛',
  //   url: '/forum',
  //   icon: MessagesSquare,
  // },
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

// Chat history items.
const chatHistory = [
  {
    title: '和Anon的聊天',
    id: '10001',
  },
  {
    title: '和Saki的聊天',
    id: '10002',
  },
];

export function MainSidebar() {
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
                  {chatHistory.map((chatItem) => (
                    <SidebarMenuItem key={chatItem.title}>
                      <SidebarMenuButton asChild>
                        <Link to={`/chat/${chatItem.id}`}>
                          <span>{chatItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
            <UserInfo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

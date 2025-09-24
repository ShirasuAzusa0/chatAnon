import { MessagesSquare, Home, Star, BookUser, ChevronDown } from 'lucide-react';

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
} from '@/components/ui/sidebar';
import { Link } from 'react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      <SidebarHeader>
        <Link to="/">
          <div className="flex items-center gap-4">
            <div className="rounded-md w-8 h-8 overflow-hidden">
              <img className="h-full object-cover" src="/icon.png" alt="icon" />
            </div>
            <span className="text-xl group-data-[state=collapsed]:hidden">Anon Chat</span>
          </div>
        </Link>
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
          <SidebarMenuItem>111</SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

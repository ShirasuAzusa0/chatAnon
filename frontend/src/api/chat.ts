import { get, post } from '@/lib/apiClient';

export interface ChatHistory {
  chatId: number; // 聊天室id
  chatName: string; // 聊天名称
  lastUpdateTime: string; // 最新更新时间
}

export interface ChatMessage {
  id: number; // 消息id
  role: 'system' | 'user' | 'assistant'; // 角色名
  roleId: number; // 角色id
  content: string; // 消息内容
  time: string; // 消息发送时间
  attachment_id?: number; // 用户上传附件（图片）的url
}

// 获取侧边栏历史聊天列表
export const fetchChatHistoryList = async () => {
  return await get<ChatHistory[]>('/api/chat-history');
};

// 用户发送消息
export const sendMessage = async (
  chatId: number,
  role: 'user',
  time: string,
  content: string,
  attachment?: File
) => {
  const formData = new FormData();
  formData.append('role', role);
  formData.append('time', time);
  formData.append('content', content);
  if (attachment) {
    formData.append('attachment', attachment);
  }
  return await post<ChatMessage>(`/api/chat/${chatId}`, formData);
};

// 获取某个聊天室的具体聊天记录
export const fetchChatMessages = async (chatId: number) => {
  return await get<ChatMessage[]>(`/api/chat/${chatId}`);
};

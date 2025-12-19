import { get, post } from '@/lib/apiClient';

// export interface ChatHistory {
//   chatId: number; // 聊天室id
//   chatName: string; // 聊天名称
//   lastUpdateTime: string; // 最新更新时间
// }

export interface ChatMessage {
  messageId: number; // 消息id
  content: string; // 消息内容
  role: 'system' | 'user' | 'assistant'; // 角色名
  createdAt: string; // 消息发送时间
}

export interface ChatSession {
  sessionId: number; // 会话id
  sessionName: string; // 会话名称
  roleName: string; // 角色名称
  modelName: string; // 模型名称
  createdAt: string; // 会话创建时间
  lastUpdatedAt: string; // 会话最后使用时间
}

// 获取侧边栏历史聊天列表
export const fetchChatHistoryList = async () => {
  return await get<ChatSession[]>('/api/chat/session/list');
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
  return await post<ChatMessage, FormData>(`/api/chat/${chatId}`, formData);
};

// 获取AI角色回复的消息,在发送消息后调用
export const receiveMessageResponse = async (chatId: number, latestMessageId: number) => {
  return await get<ChatMessage>(`/api/chat/${chatId}/receive`, { latestMessageId });
};

// 获取当前用户指定会话下的所有消息
export const fetchChatMessages = async (sessionId: number) => {
  return await get<ChatMessage[]>(`/api/chat/session/${sessionId}/messages`);
};

// 创建新的聊天会话
export const createChatSession = async (userId: number, roleId: number) => {
  return await post<ChatSession>('/api/chat/session/create', { roleId, userId });
};

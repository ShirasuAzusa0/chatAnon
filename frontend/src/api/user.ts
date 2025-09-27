import { get, post } from '@/lib/apiClient';

interface LoginResponse {
  userId: number;
  token: string;
}

export interface UserInfo {
  avatarUrl?: string;
  email: string;
  userId: number;
  userName: string;
}

// 获取公钥
export const fetchPublicKey = async () => {
  return await get<{ msg: string; key: string }>('/login/publicKey');
};

// 登录
export const login = async (account: string, password: string) => {
  return await post<LoginResponse>('/api/user/login', { account, password });
};

// 注册
export const register = async (account: string, email: string, password: string) => {
  return await post<LoginResponse>('/api/user/register', { account, email, password });
};

// 获取用户信息
export const fetchUserInfo = async (userId: number) => {
  return await get<UserInfo>(`/api/user/${userId}`);
};

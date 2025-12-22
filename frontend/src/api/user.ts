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
  reply: number; // 论坛发布回复数
  topics: number; // 论坛发布主题数
  follower: number; // 粉丝数
  following: number; // 关注数
  selfDescription: string; // 个人描述
}

// 获取公钥
export const fetchPublicKey = async () => {
  return await get<{ msg: string; key: string }>('/api/publicKey');
};

interface LoginRequest {
  email: string;
  password: string;
  captcha: string;
  captchaKey: string;
}

// 登录
export const login = async (loginRequest: LoginRequest) => {
  return await post<LoginResponse>('/api/user/login', { ...loginRequest });
};

// 注册
export const register = async (registerRequest: LoginRequest & { userName: string }) => {
  return await post<LoginResponse>('/api/user/register', { ...registerRequest });
};

// 获取用户信息
export const fetchUserInfo = async (userId: number) => {
  return await get<UserInfo>(`/api/user/${userId}`);
};

export interface UpdateUserInfoRequest {
  userId: number;
  userName?: string;
  selfDescription?: string; // 个人描述
  avatarFile?: File; // 头像文件
  password?: string; // 新密码
}

export type UpdateUserInfoResponse = Exclude<UserInfo, 'userId'>;

// 修改用户信息
export const updateUserInfo = async (userInfo: UpdateUserInfoRequest) => {
  const { userId, ...rest } = userInfo;
  return await post<UpdateUserInfoResponse>(`/api/user/edit/${userId}`, { ...rest });
};

// 获取验证码图片, 包含验证码标识 key 和 base64 编码的图片
export const fetchCaptcha = async () => {
  return await get<{ msg: string; key: string; image: string }>('/api/captcha');
};

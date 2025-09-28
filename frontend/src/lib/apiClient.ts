import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { useUserStore } from '@/stores/userStore';

// 环境配置：优先使用 Vite 环境变量，其次退回到 '/api'
const API_BASE_URL: string =
  (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  '/api';

// 统一请求错误结构
export interface ApiError {
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
}

// 可选：后端若有统一响应结构，可在此定义并在拦截器解包
// export interface ApiResponse<T> { code: string; message: string; data: T }

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：注入 Authorization
apiClient.interceptors.request.use((config) => {
  const { token } = useUserStore.getState();
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

// 响应拦截器：统一错误转换；默认直接返回 data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    const transformed: ApiError = normalizeAxiosError(error);
    // 401 处理：清理登录态
    if (transformed.status === 401) {
      const { logout } = useUserStore.getState();
      logout();
    }
    return Promise.reject(transformed);
  }
);

// 返回规范的错误消息
function normalizeAxiosError(error: AxiosError): ApiError {
  const status: number | null = error.response?.status ?? null;
  // 来自服务端的错误消息
  const serverMessage: unknown = (error.response as { msg: string } | undefined)?.msg;
  const message: string =
    typeof serverMessage === 'string' && serverMessage.length > 0
      ? serverMessage
      : error.message || 'Network Error';
  const code: string = error.code ?? 'REQUEST_ERROR';
  const details: unknown = error.response?.data ?? error.toJSON?.() ?? null;
  return { status, code, message, details };
}

// 基础请求方法，通过T指定返回数据类型；可通过config改写配置
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  // 有data就直接返回data，否则返回整个响应
  return response.data ? (response.data as T) : (response as T);
}

// 封装HTTP请求方法
export function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'GET', params });
}

export function post<T, B = unknown>(
  url: string,
  body?: B,
  config?: Omit<AxiosRequestConfig<B>, 'url' | 'method' | 'data'>
): Promise<T> {
  // 处理 FormData 类型上传
  if (body instanceof FormData) {
    const formDataConfig = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': undefined, // 让浏览器自动设置正确的 Content-Type
      },
    };
    return request<T>({ ...formDataConfig, url, method: 'POST', data: body });
  }

  // 普通 JSON 数据上传
  return request<T>({ ...config, url, method: 'POST', data: body });
}

export function put<T, B = unknown>(
  url: string,
  body?: B,
  config?: Omit<AxiosRequestConfig<B>, 'url' | 'method' | 'data'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'PUT', data: body });
}

export function del<T>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>
): Promise<T> {
  return request<T>({ ...config, url, method: 'DELETE' });
}

export { apiClient };

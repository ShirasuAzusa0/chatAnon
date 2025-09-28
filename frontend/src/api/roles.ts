import { get, post } from '@/lib/apiClient';

export interface RoleData {
  /**
   * 概览图
   */
  avatarURL: string;
  /**
   * 收藏数
   */
  favoriteCount: number;
  /**
   * 点赞数
   */
  likesCount: number;
  /**
   * 唯一标识符，用于索引、跳转、查询详情
   */
  roleId: number;
  /**
   * 角色名
   */
  roleName: string;
  /**
   * 简介
   */
  short_info: string;
}

export interface RoleTag {
  /**
   * 标签下的内容数目
   */
  Counts: number;
  /**
   * 最新更新时间
   */
  lastUpdateTime: string;
  tagId: number;
  tagName: string;
}

/**
 * 角色具体信息模型
 */
export interface RoleDetailInfo {
  avatarURL: string;
  description: string;
  favoriteCount: number;
  likesCount: number;
  roleId: number;
  roleName: string;
}

// 获取聊天角色推荐列表
export const fetchRecommendedRoleList = async () => {
  return await get<RoleData[]>('/api/role-list/recommended');
};

// 获取聊天角色最新列表
export const fetchNewestRoleList = async () => {
  return await get<RoleData[]>('/api/role-list/newest');
};

// 获取角色标签列表
export const fetchRoleTags = async () => {
  return await get<RoleTag[]>('/api/role-list/tags');
};

// 获取具体角色内容
export const fetchRoleDetail = async (roleId: number) => {
  return await get<RoleDetailInfo>(`/api/role-list/role/${roleId}`);
};

// 获取搜索角色列表
export const fetchSearchRoleList = async (searchParam: string) => {
  return await get<RoleData[]>(`/api/role-list/search/${searchParam}`);
};

// 获取标签下的角色列表
export const fetchRoleListByTag = async (tagName: string) => {
  return await get<RoleData[]>(`/api/role-list/${tagName}`);
};

// 用户创建自定义角色
export const createCustomRole = async (
  roleName: string,
  description: string,
  tags?: string[],
  attachment?: File
) => {
  const formData = new FormData();
  formData.append('roleName', roleName);
  formData.append('description', description);
  if (tags) formData.append('tags', JSON.stringify(tags));
  if (attachment) formData.append('attachment', attachment);
  return await post<{ roleId: number; roleName: string }, FormData>('/api/role-list/new', formData);
};

// 获取用户收藏的角色列表
export const fetchFavoriteRoleList = async () => {
  return await get<RoleData[]>('/api/role-list/favorite');
};

// 获取历史的聊天角色列表
export const fetchHistroyRoleList = async () => {
  return await get<RoleData[]>('/api/role-list/history');
};

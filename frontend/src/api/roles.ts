import { get, post } from '@/lib/apiClient';
import type { ModelInfo } from '@/types';

export interface RoleData {
  /** 概览图 */
  avatarURL: string;
  /** 收藏数 */
  favoriteCount: number;
  /** 点赞数 */
  likesCount: number;
  /** 唯一标识符，用于索引、跳转、查询详情 */
  roleId: number;
  /** 角色名 */
  roleName: string;
  /** 角色简介 */
  shortInfo: string;
}

export interface RoleTag {
  /** 标签下的内容数目 */
  counts: number;
  /** 最新更新时间 */
  lastUpdateTime: string;
  tagId: number;
  tagName: string;
  /** 标签颜色 */
  hueColor: number;
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
  model: ModelInfo;
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
export const fetchSearchRoleList = async (searchParam: string, tag?: string) => {
  return await get<RoleData[]>(`/api/role-list/search/${searchParam}${tag ? `?tag=${tag}` : ''}`);
};

// 获取标签下的角色列表
export const fetchRoleListByTag = async (tagName: string) => {
  return await get<RoleData[]>(`/api/role-list/${tagName}`);
};

export interface CreateCustomRoleRequest {
  roleName: string; //用户新建的角色名称
  description: string; // 用户输入的角色描述，可用于调用模型
  avatar?: File; // 用户上传的角色头像
  tags: string[]; // 用户选择角色分类标签
  userId: number; // 用户ID
  shortInfo: string; // 用户输入的角色简短介绍
  prompt: string; // 用户上传的角色详细的提示词
}

// 用户创建自定义角色
export const createCustomRole = async (createCustomRoleRequest: CreateCustomRoleRequest) => {
  const formData = new FormData();
  Object.entries(createCustomRoleRequest).forEach(([key, value]) => {
    if (key && value !== undefined) formData.append(key, value);
  });
  return await post<RoleDetailInfo, FormData>('/api/role-list/newrole', formData);
};

// 获取用户收藏的角色列表
export const fetchFavoriteRoleList = async (userId: number) => {
  return await get<RoleData[]>(`/api/role-list/${userId}/favorite`);
};

// 获取历史的聊天角色列表
export const fetchHistroyRoleList = async () => {
  return await get<RoleData[]>('/api/role-list/history');
};

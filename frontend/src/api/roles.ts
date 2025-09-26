import { get } from '@/lib/apiClient';

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
   * 标签颜色
   */
  hueColor: string;
  /**
   * 最新更新时间
   */
  lastUpdateTime: string;
  tagId: number;
  tagName: string;
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
export const fetchRoleDetail = async () => {
  return await get<RoleData>('/api/role-list/tags');
};

export const fetchSearchRoleList = async (searchParam: string) => {
  return await get<RoleData[]>(`/api/role-list/search/${searchParam}`);
};

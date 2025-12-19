export type ResponseStatus = 'success' | 'error';

export interface BaseResponse<T> {
  status: ResponseStatus;
  msg: string;
  data?: T;
}

export interface ModelInfo {
  modelName: string;
  modelVersion: string;
}

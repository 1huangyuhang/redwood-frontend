/** 与后端 types/apiResponse 对齐 */

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type RegisterSuccessData = {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
};

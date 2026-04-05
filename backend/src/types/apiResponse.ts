/**
 * 统一 API 响应（前期开发约定，便于前端与监控解析）。
 * 成功：HTTP 2xx + success: true
 * 失败：HTTP 4xx/5xx + success: false
 */
export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
  /** 业务或错误码，可选 */
  code?: string;
  /** 校验类错误可附 Zod flatten 等 */
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiSuccess<T>(message: string, data: T): ApiSuccess<T> {
  return { success: true, message, data };
}

export function apiFailure(
  message: string,
  options?: { code?: string; details?: unknown }
): ApiFailure {
  return {
    success: false,
    message,
    data: null,
    ...(options?.code ? { code: options.code } : {}),
    ...(options?.details !== undefined ? { details: options.details } : {}),
  };
}

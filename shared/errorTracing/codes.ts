/**
 * 稳定错误码：前后端约定字符串，便于检索与文档化。
 */
export const ErrorCodes = {
  UNKNOWN: 'UNKNOWN',
  NET_NO_RESPONSE: 'NET_NO_RESPONSE',
  NET_TIMEOUT: 'NET_TIMEOUT',
  NET_CONFIG: 'NET_CONFIG',
  HTTP_ERROR: 'HTTP_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

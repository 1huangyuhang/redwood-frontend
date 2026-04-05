import axios from 'axios';
import { isTraceableError } from '@shared/errorTracing';

/**
 * 从 axios 错误中取出对用户友好的文案（兼容后端 { error } / { message }）。
 */
export function getRequestErrorMessage(err: unknown, fallback: string): string {
  if (isTraceableError(err)) {
    return err.message;
  }
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      if (typeof o.error === 'string' && o.error.trim()) return o.error;
      if (typeof o.message === 'string' && o.message.trim()) return o.message;
    }
    if (err.response?.status === 404) {
      return '服务暂不可用，请稍后再试';
    }
    if (!err.response) {
      return '网络异常，请检查连接后重试';
    }
  }
  return fallback;
}

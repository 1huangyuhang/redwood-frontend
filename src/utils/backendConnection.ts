import type { AxiosError } from 'axios';

/** Vite 代理指向的后端默认端口（与 vite.config.ts、backend app 一致） */
export const DEFAULT_BACKEND_PORT = 3000;

export function getBackendUnreachableHint(): string {
  return `无法连接后端 API（常见原因：未启动后端或端口不一致）。请在项目根目录执行：npm run dev --prefix backend（默认监听 ${DEFAULT_BACKEND_PORT}，须与 vite.config.ts 里 proxy.target 一致），并确保数据库已就绪。`;
}

/**
 * 无 response、网关错误、或 Vite 代理 ECONNREFUSED 等导致的 500。
 */
export function isBackendUnreachableError(error: AxiosError): boolean {
  if (!error.response) return true;
  const s = error.response.status;
  if (s === 502 || s === 503 || s === 504) return true;
  if (s === 500) {
    const data = error.response.data;
    if (data == null || data === '') return true;
    const str =
      typeof data === 'string'
        ? data
        : typeof data === 'object'
          ? JSON.stringify(data)
          : '';
    if (
      /ECONNREFUSED|proxy error|connect ECONNREFUSED|socket hang up/i.test(str)
    ) {
      return true;
    }
  }
  return false;
}

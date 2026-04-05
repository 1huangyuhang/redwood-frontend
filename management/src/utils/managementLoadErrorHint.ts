import {
  ErrorCodes,
  isTraceableError,
  wrapAxiosError,
  type TraceableError,
} from '@shared/errorTracing';
import {
  getManagementApiBaseURL,
  getManagementSocketHttpOrigin,
} from '../config/managementApiBase';

/**
 * 管理端列表类接口加载失败时的可读说明（网络 / 鉴权 / 服务端文案）
 */
export function formatManagementListLoadError(
  err: unknown,
  resourceLabel: string
): string {
  const te: TraceableError = isTraceableError(err) ? err : wrapAxiosError(err);
  const prefix = `加载${resourceLabel}失败`;
  const { errorCode, context, message: serverMsg } = te;
  const status = context.httpStatus;

  if (
    errorCode === ErrorCodes.NET_NO_RESPONSE ||
    errorCode === ErrorCodes.NET_TIMEOUT
  ) {
    const backend = getManagementSocketHttpOrigin();
    const devHint = import.meta.env.DEV
      ? `开发环境：浏览器只访问 /api，由 Vite 转发到后端（默认 ${backend}）。请确认该后端已启动。`
      : `请确认网络与部署配置可用（axios baseURL：${getManagementApiBaseURL()}）。`;
    return `${prefix}：${serverMsg} ${devHint}`;
  }

  if (status === 401 || errorCode === ErrorCodes.UNAUTHORIZED) {
    return `${prefix}：${serverMsg} 若使用 API Key，请将 management/.env 中 VITE_API_KEY 与 backend/.env 中 API_KEY 设为同一值；否则请重新登录管理端。`;
  }

  if (status === 403 || errorCode === ErrorCodes.FORBIDDEN) {
    return `${prefix}：${serverMsg}`;
  }

  return `${prefix}：${serverMsg}`;
}

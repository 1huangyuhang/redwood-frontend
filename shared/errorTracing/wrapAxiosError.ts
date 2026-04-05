import axios, { type AxiosError } from 'axios';
import { ErrorCodes, type ErrorCode } from './codes';
import { generateTraceRef } from './refs';
import { TraceableError } from './TraceableError';

function pickServerCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.code === 'string' && o.code.trim()) return o.code;
  return undefined;
}

function pickServerErrorRef(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.errorRef === 'string' && o.errorRef.trim()) return o.errorRef;
  return undefined;
}

function pickRequestIdFromHeaders(h: unknown): string | undefined {
  if (!h || typeof h !== 'object') return undefined;
  const anyH = h as { get?: (key: string) => unknown };
  if (typeof anyH.get === 'function') {
    const a = anyH.get('x-request-id') ?? anyH.get('X-Request-Id');
    if (typeof a === 'string' && a.trim()) return a;
  }
  const rec = h as Record<string, unknown>;
  const v = rec['x-request-id'] ?? rec['X-Request-Id'];
  if (typeof v === 'string' && v.trim()) return v;
  return undefined;
}

function mapStatusToCode(status: number): ErrorCode {
  if (status === 401) return ErrorCodes.UNAUTHORIZED;
  if (status === 403) return ErrorCodes.FORBIDDEN;
  if (status === 404) return ErrorCodes.NOT_FOUND;
  if (status >= 500) return ErrorCodes.INTERNAL;
  return ErrorCodes.HTTP_ERROR;
}

function defaultMessage(err: AxiosError): string {
  const data = err.response?.data;
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
  }
  if (err.response?.status === 404) return '服务暂不可用，请稍后再试';
  if (!err.response) return '网络异常，请检查连接后重试';
  return `请求失败（HTTP ${err.response.status}）`;
}

export function wrapAxiosError(
  err: unknown,
  extra?: { module?: string; operation?: string }
): TraceableError {
  const ref = generateTraceRef('cfe');

  if (!axios.isAxiosError(err)) {
    const msg = err instanceof Error ? err.message : String(err);
    return new TraceableError(msg || '未知错误', ref, ErrorCodes.UNKNOWN, {
      ...extra,
    });
  }

  const ax = err as AxiosError;
  const cfg = ax.config;
  const clientTraceId =
    (cfg as { clientTraceId?: string })?.clientTraceId ??
    (typeof cfg?.headers?.['X-Client-Trace-Id'] === 'string'
      ? (cfg.headers['X-Client-Trace-Id'] as string)
      : undefined);

  const requestId = pickRequestIdFromHeaders(ax.response?.headers);
  const data = ax.response?.data;
  const serverRef = pickServerErrorRef(data);
  const serverCode = pickServerCode(data);
  const status = ax.response?.status;
  const errorCode: ErrorCode | string =
    serverCode ??
    (status != null ? mapStatusToCode(status) : ErrorCodes.NET_NO_RESPONSE);

  if (ax.code === 'ECONNABORTED') {
    return new TraceableError(
      '请求超时，请稍后重试',
      ref,
      ErrorCodes.NET_TIMEOUT,
      {
        ...extra,
        clientTraceId,
        requestId,
        errorRef: serverRef,
        httpStatus: status,
        method: cfg?.method?.toUpperCase(),
        url: cfg?.url,
      }
    );
  }

  if (ax.response) {
    return new TraceableError(defaultMessage(ax), ref, errorCode, {
      ...extra,
      clientTraceId,
      requestId,
      errorRef: serverRef,
      code: serverCode,
      httpStatus: status,
      method: cfg?.method?.toUpperCase(),
      url: cfg?.url,
    });
  }

  if (ax.request) {
    return new TraceableError(
      defaultMessage(ax),
      ref,
      ErrorCodes.NET_NO_RESPONSE,
      {
        ...extra,
        clientTraceId,
        requestId,
        method: cfg?.method?.toUpperCase(),
        url: cfg?.url,
      }
    );
  }

  return new TraceableError(
    ax.message || '请求配置错误',
    ref,
    ErrorCodes.NET_CONFIG,
    {
      ...extra,
      clientTraceId,
      method: cfg?.method?.toUpperCase(),
      url: cfg?.url,
    }
  );
}

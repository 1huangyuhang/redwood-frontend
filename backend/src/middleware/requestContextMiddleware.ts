import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * 为每个 HTTP 请求分配 requestId，写入响应头 X-Request-Id。
 * 若客户端传入 X-Client-Trace-Id，则沿用该值以便前后端日志对齐。
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const fromClient = req.headers['x-client-trace-id'];
  const requestId =
    typeof fromClient === 'string' && fromClient.trim()
      ? fromClient.trim()
      : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

/**
 * 可由控制器抛给全局 errorHandler 的 HTTP 语义错误（业务规则 / 404 等）。
 */
export class HttpError extends Error {
  override name = 'HttpError';

  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

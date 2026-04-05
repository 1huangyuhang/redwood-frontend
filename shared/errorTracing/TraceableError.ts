import type { ErrorCode } from './codes';

export const TRACEABLE_ERROR_MARK = 'TraceableError' as const;

export type TraceContext = {
  module?: string;
  operation?: string;
  requestId?: string;
  errorRef?: string;
  code?: string;
  clientTraceId?: string;
  httpStatus?: number;
  method?: string;
  url?: string;
};

export class TraceableError extends Error {
  readonly mark = TRACEABLE_ERROR_MARK;

  constructor(
    message: string,
    public readonly ref: string,
    public readonly errorCode: ErrorCode | string,
    public readonly context: TraceContext = {}
  ) {
    super(message);
    this.name = 'TraceableError';
  }

  toLogString(): string {
    const c = this.context;
    return `[trace:${this.ref}][code:${this.errorCode}] ${this.message} | reqId=${c.requestId ?? '-'} | errRef=${c.errorRef ?? '-'} | client=${c.clientTraceId ?? '-'} | ${c.method ?? '?'} ${c.url ?? '?'}`;
  }

  toUserHint(includeRef = false): string {
    if (!includeRef) return this.message;
    return `${this.message}（错误标记：${this.ref}）`;
  }
}

export function isTraceableError(e: unknown): e is TraceableError {
  return (
    e instanceof TraceableError ||
    (!!e &&
      typeof e === 'object' &&
      (e as { mark?: string }).mark === TRACEABLE_ERROR_MARK)
  );
}

import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** HTTP 请求链路 id，与 X-Request-Id / 前端 X-Client-Trace-Id 对齐 */
      requestId?: string;
      /** 已通过 JWT 或管理端鉴权解析出的用户 */
      authUser?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
      };
      authMethod?: 'apiKey' | 'jwt';
    }
  }
}

export {};

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwtService';
import { getManagementJwtRoleSet } from '../config/managementRoles';
/**
 * 管理类 API：允许
 * 1) 有效 x-api-key（脚本/自动化）
 * 2) 有效 JWT 且角色在 MANAGEMENT_JWT_ROLES 内（默认 ADMIN + USER，与前台注册账号打通）
 */
export const managementAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const envKey = process.env['API_KEY'] || 'default-api-key';
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (apiKey && apiKey === envKey) {
    req.authMethod = 'apiKey';
    next();
    return;
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: '请提供有效的 API Key 或登录令牌',
      statusCode: 401,
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
    return;
  }

  const token = auth.slice(7).trim();
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: '缺少访问令牌',
      statusCode: 401,
      code: 'AUTH_TOKEN_MISSING',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const allowedRoles = getManagementJwtRoleSet();
    if (!allowedRoles.has(payload.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message:
          '当前账号无权访问该接口；可在服务端配置 MANAGEMENT_JWT_ROLES，或使用 API Key',
        statusCode: 403,
        code: 'MANAGEMENT_ROLE_FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
      return;
    }
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
    req.authMethod = 'jwt';
    next();
  } catch {
    res.status(401).json({
      error: 'Unauthorized',
      message: '令牌无效或已过期',
      statusCode: 401,
      code: 'AUTH_TOKEN_INVALID',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
};

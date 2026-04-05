import type { Request, Response, NextFunction } from 'express';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * 当环境变量 MANAGEMENT_USER_READONLY=1 时：JWT 角色为 USER 的账号仅允许读接口；
 * API Key 与 ADMIN 角色不受影响（便于脚本与管理员账号）。
 */
export const adminUserReadOnlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const enabled = process.env['MANAGEMENT_USER_READONLY'] === '1';
  if (!enabled) {
    next();
    return;
  }

  const method = (req.method || 'GET').toUpperCase();
  if (READ_METHODS.has(method)) {
    next();
    return;
  }

  if (req.authMethod === 'apiKey') {
    next();
    return;
  }

  if (req.authUser?.role === 'USER') {
    res.status(403).json({
      error: 'Forbidden',
      message: '当前账号为只读运营角色，无权执行写入操作',
      statusCode: 403,
      code: 'USER_READ_ONLY',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
    return;
  }

  next();
};

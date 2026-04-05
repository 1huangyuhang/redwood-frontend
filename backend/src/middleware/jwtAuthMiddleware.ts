import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwtService';

/** 任意已登录用户（USER / ADMIN） */
export const jwtAuthRequired = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: '请先登录',
      statusCode: 401,
    });
    return;
  }

  const token = auth.slice(7).trim();
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: '缺少访问令牌',
      statusCode: 401,
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
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
    });
  }
};

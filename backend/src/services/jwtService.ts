import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  email: string;
  username: string;
};

function getSecret(): string {
  const s = process.env['JWT_SECRET'];
  if (!s || s.length < 32) {
    throw new Error(
      'JWT_SECRET 未配置或长度不足 32 字符，请在 .env 中设置强随机密钥'
    );
  }
  return s;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const envExp = process.env['JWT_EXPIRES_IN'];
  const expiresIn: NonNullable<SignOptions['expiresIn']> =
    envExp != null && envExp !== ''
      ? (envExp as NonNullable<SignOptions['expiresIn']>)
      : '7d';
  const signOptions: SignOptions = {
    expiresIn,
    issuer: 'redwood-api',
    audience: 'redwood-clients',
  };
  return jwt.sign(
    {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
      username: payload.username,
    },
    getSecret(),
    signOptions
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret(), {
    issuer: 'redwood-api',
    audience: 'redwood-clients',
  }) as jwt.JwtPayload;

  const sub = decoded['sub'];
  const role = decoded['role'];
  const email = decoded['email'];
  const username = decoded['username'];

  if (
    typeof sub !== 'string' ||
    (role !== 'USER' && role !== 'ADMIN') ||
    typeof email !== 'string' ||
    typeof username !== 'string'
  ) {
    throw new jwt.JsonWebTokenError('invalid payload');
  }

  return { sub, role, email, username };
}

import { Prisma } from '@prisma/client';
import type { RegisterDto } from '../dto/register.dto';
import * as userDao from '../dao/userDao';
import { hashPassword } from './passwordService';
import { signAccessToken } from './jwtService';

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'api',
  'null',
  'undefined',
]);

export type PublicUser = {
  id: string;
  email: string;
  username: string;
  role: string;
};

function toPublicUser(u: {
  id: string;
  email: string;
  username: string;
  role: string;
}): PublicUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
  };
}

export class RegisterReservedUsernameError extends Error {
  readonly statusCode = 400;
  constructor() {
    super('用户名不可用');
    this.name = 'RegisterReservedUsernameError';
  }
}

export class RegisterConflictError extends Error {
  readonly statusCode = 409;
  constructor() {
    super('该邮箱或用户名已被注册');
    this.name = 'RegisterConflictError';
  }
}

/**
 * 注册业务：保留名校验 → 存在性 → 密码哈希 → 落库 → 签发令牌。
 */
export async function registerUser(
  dto: RegisterDto
): Promise<{ token: string; user: PublicUser }> {
  if (RESERVED_USERNAMES.has(dto.username)) {
    throw new RegisterReservedUsernameError();
  }

  const exists = await userDao.userExistsByEmailOrUsername(
    dto.email,
    dto.username
  );
  if (exists) {
    throw new RegisterConflictError();
  }

  const passwordHash = await hashPassword(dto.password);

  try {
    const user = await userDao.createUserRecord({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    });

    return { token, user: toPublicUser(user) };
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new RegisterConflictError();
    }
    throw err;
  }
}

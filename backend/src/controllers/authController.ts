import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import prisma from '../utils/prisma';
import { loginSchema } from '../schemas/authSchema';
import { verifyPassword } from '../services/passwordService';
import { signAccessToken } from '../services/jwtService';
import { zodFirstUserMessage } from '../utils/zodFirstMessage';

function publicUser(u: {
  id: string;
  email: string;
  username: string;
  role: string;
}) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
  };
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);
    const idRaw = parsed.identifier.trim();
    const idLower = idRaw.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: idLower }, { username: idLower }],
      },
    });

    const ok = user
      ? await verifyPassword(parsed.password, user.passwordHash)
      : false;

    if (!user || !ok) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '账号或密码错误',
      });
      return;
    }

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    });

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: zodFirstUserMessage(err),
        details: err.flatten(),
      });
      return;
    }
    const msg = err instanceof Error ? err.message : '登录失败';
    res.status(400).json({ error: msg });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const auth = req.authUser;
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, email: true, username: true, role: true },
  });

  if (!user) {
    res.status(401).json({ error: '用户不存在或已删除' });
    return;
  }

  res.json({ user: publicUser(user) });
};

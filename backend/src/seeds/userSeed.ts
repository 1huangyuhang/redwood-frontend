import prisma from '../utils/prisma';
import { hashPassword } from '../services/passwordService';

/**
 * 写入默认管理员（邮箱 + 用户名 + 角色 ADMIN）。
 * 每次 seed 会按环境变量刷新该账号密码哈希，便于开发环境重置。
 */
export async function seedAdminUser(): Promise<void> {
  const email = (
    process.env['ADMIN_EMAIL'] || 'admin@example.com'
  ).toLowerCase();
  const username = (
    process.env['ADMIN_USERNAME_SEED'] || 'admin'
  ).toLowerCase();
  const plain = process.env['ADMIN_INITIAL_PASSWORD'] || 'ChangeMe_Admin1!';

  const passwordHash = await hashPassword(plain);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      username,
      passwordHash,
      role: 'ADMIN',
    },
    update: {
      passwordHash,
      role: 'ADMIN',
      username,
    },
  });

  console.log(`User seed: admin upserted (${email} / ${username})`);
}

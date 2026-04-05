import prisma from '../utils/prisma';

/**
 * DAO：用户持久化，仅数据访问，不含业务规则。
 */
export async function userExistsByEmailOrUsername(
  email: string,
  username: string
): Promise<boolean> {
  const row = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
  return row != null;
}

export async function createUserRecord(input: {
  email: string;
  username: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash: input.passwordHash,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });
}

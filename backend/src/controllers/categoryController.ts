import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

/** 管理端 / 表单：下拉用类目列表 */
export const getCategories = async (_req: Request, res: Response) => {
  const data = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      sortOrder: true,
    },
  });
  res.json({ data });
};

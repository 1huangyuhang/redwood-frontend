import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * 管理端首页聚合统计：一次请求替代多次分页接口，降低限流与重复报错风险。
 */
export const getStatsSummary = async (_req: Request, res: Response) => {
  const [
    productCount,
    activityCount,
    newsCount,
    siteAssetCount,
    courseCount,
    pricingPlanCount,
    contactMessageCount,
    supportTicketCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.activity.count(),
    prisma.news.count(),
    prisma.siteAsset.count(),
    prisma.course.count(),
    prisma.pricingPlan.count(),
    prisma.contactMessage.count(),
    prisma.supportTicket.count(),
  ]);

  res.json({
    data: {
      productCount,
      activityCount,
      newsCount,
      siteAssetCount,
      courseCount,
      pricingPlanCount,
      contactMessageCount,
      supportTicketCount,
    },
  });
};

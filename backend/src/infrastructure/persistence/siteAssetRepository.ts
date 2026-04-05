import type { Prisma, SiteAsset } from '@prisma/client';
import prisma from '../../utils/prisma';

export async function findManySiteAssets(
  where: Prisma.SiteAssetWhereInput
): Promise<SiteAsset[]> {
  return prisma.siteAsset.findMany({
    where,
    orderBy: [{ page: 'asc' }, { groupKey: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function findSiteAssetById(id: number): Promise<SiteAsset | null> {
  return prisma.siteAsset.findUnique({ where: { id } });
}

export async function createSiteAssetRow(
  data: Prisma.SiteAssetCreateInput
): Promise<SiteAsset> {
  return prisma.siteAsset.create({ data });
}

export async function updateSiteAssetRow(
  id: number,
  data: Prisma.SiteAssetUpdateInput
): Promise<SiteAsset> {
  return prisma.siteAsset.update({ where: { id }, data });
}

export async function deleteSiteAssetRow(id: number): Promise<void> {
  await prisma.siteAsset.delete({ where: { id } });
}

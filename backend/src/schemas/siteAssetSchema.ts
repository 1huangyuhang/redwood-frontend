import { z } from 'zod';

const optionalImageUrl = z
  .union([z.string().url().max(2048), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

export const createSiteAssetSchema = z
  .object({
    page: z.string().min(1).max(64),
    groupKey: z.string().min(1).max(64),
    sortOrder: z.coerce.number().int().default(0),
    title: z.union([z.string().max(255), z.literal('')]).optional(),
    alt: z.union([z.string().max(255), z.literal('')]).optional(),
    content: z.union([z.string(), z.literal('')]).optional(),
    meta: z.union([z.string(), z.literal('')]).optional(),
    videoUrl: z.union([z.string().max(1024), z.literal('')]).optional(),
  })
  .extend({
    imageUrl: optionalImageUrl,
  });

export const updateSiteAssetSchema = createSiteAssetSchema.partial();

/** 通过公网图片 URL 拉取二进制并创建站点素材（JSON Body，非 multipart） */
export const createSiteAssetFromUrlSchema = createSiteAssetSchema.extend({
  imageUrl: z.string().url().max(2048),
});

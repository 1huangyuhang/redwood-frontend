import { z } from 'zod';

const optionalImageUrl = z
  .union([z.string().url().max(2048), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

const numish = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? parseFloat(v) : v));

export const createPricingPlanSchema = z.object({
  name: z.string().min(1).max(255),
  price: numish
    .refine((v) => !Number.isNaN(v), '价格无效')
    .refine((v) => v >= 0, '价格不能为负'),
  description: z.string().min(1),
  features: z.string().min(2), // JSON array string
  isPopular: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) =>
      v === undefined
        ? false
        : typeof v === 'string'
          ? v.toLowerCase() === 'true'
          : v
    ),
  tag: z.string().max(64).optional().nullable(),
  sortOrder: numish
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? 0 : Math.floor(v))),
  imageUrl: optionalImageUrl,
});

export const updatePricingPlanSchema = createPricingPlanSchema.partial();

export const pricingPlanQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, '页码必须大于0'),
  pageSize: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, '每页数量必须在1-100之间'),
  search: z.string().optional(),
});

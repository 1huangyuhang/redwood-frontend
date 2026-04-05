import { z } from 'zod';

const optionalImageUrl = z
  .union([z.string().url().max(2048), z.literal('')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

const numish = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? parseFloat(v) : v));

export const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  instructor: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  duration: z.string().min(1).max(64),
  students: numish
    .refine((v) => !Number.isNaN(v), '人数无效')
    .refine((v) => v >= 0, '人数不能为负')
    .transform((v) => Math.floor(v)),
  rating: numish
    .refine((v) => !Number.isNaN(v), '评分无效')
    .refine((v) => v >= 0 && v <= 5, '评分 0–5'),
  price: numish
    .refine((v) => !Number.isNaN(v), '价格无效')
    .refine((v) => v >= 0, '价格不能为负'),
  description: z.string().min(1),
  tags: z.string().optional().default('[]'),
  sortOrder: numish
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? 0 : Math.floor(v))),
  imageUrl: optionalImageUrl,
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.object({
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
  category: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

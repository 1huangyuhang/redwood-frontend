import { z } from 'zod';

/** OWASP 风格：长度 + 大小写 + 数字（可选特殊字符） */
export const passwordSchema = z
  .string()
  .min(10, '密码至少 10 位')
  .max(128, '密码过长')
  .regex(/[A-Z]/, '需包含大写字母')
  .regex(/[a-z]/, '需包含小写字母')
  .regex(/[0-9]/, '需包含数字');

export const usernameSchema = z
  .string()
  .trim()
  .min(3, '用户名至少 3 个字符')
  .max(32, '用户名最多 32 个字符')
  .regex(/^[a-z0-9_]+$/, '仅允许小写字母、数字与下划线')
  .transform((s) => s.toLowerCase());

export const emailSchema = z
  .string()
  .trim()
  .email('请输入有效邮箱')
  .max(255)
  .transform((s) => s.toLowerCase());

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, '请输入邮箱或用户名')
      .max(255, '账号过长'),
    password: z.string().min(1, '请输入密码'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

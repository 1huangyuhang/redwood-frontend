import { registerSchema } from '../schemas/authSchema';
import type { z } from 'zod';

/** 注册请求 DTO（与 Zod 校验同源，避免重复定义） */
export const registerDtoSchema = registerSchema;

export type RegisterDto = z.infer<typeof registerDtoSchema>;

export function parseRegisterDto(body: unknown): RegisterDto {
  return registerDtoSchema.parse(body);
}

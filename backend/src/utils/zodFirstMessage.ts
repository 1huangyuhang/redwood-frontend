import { ZodError } from 'zod';

/** 取第一条可展示给用户的校验文案（字段错误优先）。 */
export function zodFirstUserMessage(err: ZodError): string {
  const flat = err.flatten();
  const fieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
  for (const msgs of Object.values(fieldErrors)) {
    const first = msgs?.[0];
    if (first) return first;
  }
  if (flat.formErrors[0]) return flat.formErrors[0];
  return '输入不符合要求';
}

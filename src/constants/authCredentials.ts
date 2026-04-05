/** 与 backend/schemas/authSchema 保持一致 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 32;
/** 仅小写、数字、下划线（提交前会 toLowerCase） */
export const USERNAME_PATTERN = /^[a-z0-9_]+$/;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** 与 backend/schemas/authSchema passwordSchema 完全一致，用于前端拦截无效提交 */
export function getRegisterPasswordError(password: string): string | null {
  if (!password.trim()) return '请输入密码';
  if (password.length < PASSWORD_MIN) return `密码至少 ${PASSWORD_MIN} 位`;
  if (password.length > PASSWORD_MAX) return '密码过长';
  if (!/[A-Z]/.test(password)) return '需包含大写字母';
  if (!/[a-z]/.test(password)) return '需包含小写字母';
  if (!/[0-9]/.test(password)) return '需包含数字';
  return null;
}

export const REGISTER_PASSWORD_HINT = `至少 ${PASSWORD_MIN} 位，须同时包含大写字母、小写字母和数字（与服务器校验一致）`;

export const EMAIL_MAX_LEN = 255;

export const LOGIN_IDENTIFIER_MAX = 255;

/** 与 backend authController RESERVED_USERNAMES 一致 */
export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'api',
  'null',
  'undefined',
]);

/**
 * 与后端 MANAGEMENT_JWT_ROLES 语义一致（管理端构建时使用 VITE_ 前缀）。
 * 未配置时默认 ADMIN,USER，与后端默认一致。
 */
const DEFAULT = 'ADMIN,USER';

export function getManagementJwtRolesFromEnv(): string[] {
  const raw = (import.meta.env.VITE_MANAGEMENT_JWT_ROLES ?? DEFAULT).trim();
  if (!raw) return ['ADMIN', 'USER'];
  return raw
    .split(',')
    .map((s: string) => s.trim().toUpperCase())
    .filter(Boolean);
}

export function roleCanAccessManagement(role: string): boolean {
  const allowed = new Set(getManagementJwtRolesFromEnv());
  if (allowed.size === 0) return false;
  return allowed.has(role.toUpperCase());
}

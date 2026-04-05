import type { UserRole } from '@prisma/client';

const KNOWN: UserRole[] = ['ADMIN', 'USER'];

/**
 * 允许携带 JWT 访问「管理类」业务接口的角色集合。
 * 环境变量 MANAGEMENT_JWT_ROLES 逗号分隔，如 ADMIN 或 ADMIN,USER。
 * 未配置时默认 ADMIN,USER，便于前台注册用户同一账号登录管理端；公网生产建议设为 ADMIN。
 */
export function getManagementJwtRoleSet(): Set<UserRole> {
  const raw = process.env['MANAGEMENT_JWT_ROLES']?.trim();
  const parts =
    raw && raw.length > 0
      ? raw
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : (['ADMIN', 'USER'] as const);

  const set = new Set<UserRole>();
  for (const p of parts) {
    if (KNOWN.includes(p as UserRole)) {
      set.add(p as UserRole);
    }
  }
  if (set.size === 0) {
    set.add('ADMIN');
  }
  return set;
}

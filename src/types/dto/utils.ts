/** 将接口未知字段安全转为 DTO 标量 */

export function coerceNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function coerceString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

export function coerceNullableString(v: unknown): string | null {
  if (v == null) return null;
  const s = coerceString(v);
  return s === '' ? null : s;
}

export function coerceBoolean(v: unknown, defaultValue = false): boolean {
  if (typeof v === 'boolean') return v;
  return defaultValue;
}

export function coerceIsoDateString(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString();
  }
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

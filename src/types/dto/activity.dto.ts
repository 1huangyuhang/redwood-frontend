import type { MediaFieldsDTO } from './media';
import {
  coerceNumber,
  coerceString,
  coerceIsoDateString,
  coerceNullableString,
} from './utils';

/** 官网活动卡片：文案与图均来自库表 Activity */
export type ActivityDTO = MediaFieldsDTO & {
  id: number;
  title: string;
  description: string;
  /** 展示与日历用日期（接口无独立 date 字段时用 createdAt 推导） */
  date: string;
  createdAt: string;
  updatedAt: string;
};

export function activityDisplayDateFromRow(
  row: Record<string, unknown>
): string {
  if (typeof row.date === 'string' && row.date.trim()) {
    return row.date.trim();
  }
  const created = row.createdAt;
  if (created instanceof Date) {
    return created.toISOString().slice(0, 10);
  }
  if (typeof created === 'string' && created) {
    return created.slice(0, 10);
  }
  return '日期待定';
}

export function parseActivityDto(raw: unknown): ActivityDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  if (id == null) return null;

  const createdAt = coerceIsoDateString(o.createdAt) ?? '';
  const updatedAt = coerceIsoDateString(o.updatedAt) ?? '';

  return {
    id,
    title: coerceString(o.title),
    description: coerceString(o.description),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    date: activityDisplayDateFromRow(o),
    createdAt,
    updatedAt,
  };
}

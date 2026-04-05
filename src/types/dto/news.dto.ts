import type { MediaFieldsDTO } from './media';
import {
  coerceNumber,
  coerceString,
  coerceIsoDateString,
  coerceNullableString,
} from './utils';

/** 官网新闻列表项（与 `formatNews` 列表一致） */
export type NewsListItemDTO = MediaFieldsDTO & {
  id: number;
  title: string;
  date: string;
  time: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export function parseNewsListItemDto(raw: unknown): NewsListItemDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  if (id == null) return null;

  const summaryRaw = o.summary;
  const contentRaw = o.content;
  const summary =
    typeof summaryRaw === 'string' && summaryRaw.trim()
      ? summaryRaw
      : coerceString(contentRaw);

  return {
    id,
    title: coerceString(o.title),
    date: coerceString(o.date),
    time: coerceString(o.time),
    summary,
    content: coerceString(contentRaw),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    createdAt: coerceIsoDateString(o.createdAt) ?? '',
    updatedAt: coerceIsoDateString(o.updatedAt) ?? '',
  };
}

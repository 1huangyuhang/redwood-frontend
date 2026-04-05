import {
  coerceNumber,
  coerceString,
  coerceNullableString,
  coerceIsoDateString,
} from './utils';
import type { MediaFieldsDTO } from './media';

/**
 * 站点可配置素材（与后端 `SerializedSiteAsset` / `GET /api/site-assets` 一致）。
 * 首页/关于等区块的标题、正文、图、视频 URL 均由此 DTO 驱动。
 */
export type SiteAssetDTO = MediaFieldsDTO & {
  id: number;
  page: string;
  groupKey: string;
  sortOrder: number;
  title: string | null;
  alt: string | null;
  content: string | null;
  meta: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function parseSiteAssetDto(raw: unknown): SiteAssetDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  const sortOrder = coerceNumber(o.sortOrder);
  if (id == null || sortOrder == null) return null;

  return {
    id,
    page: coerceString(o.page),
    groupKey: coerceString(o.groupKey),
    sortOrder,
    title: coerceNullableString(o.title),
    alt: coerceNullableString(o.alt),
    content: coerceNullableString(o.content),
    meta: coerceNullableString(o.meta),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    videoUrl: coerceNullableString(o.videoUrl),
    createdAt: coerceIsoDateString(o.createdAt) ?? '',
    updatedAt: coerceIsoDateString(o.updatedAt) ?? '',
  };
}

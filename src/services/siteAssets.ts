import axiosInstance from './api/axiosInstance';
import type { SiteAssetDTO } from '@/types/dto/siteAsset.dto';
import { parseSiteAssetDto } from '@/types/dto/siteAsset.dto';

export type { SiteAssetDTO };

/** 解析 case_item 的 meta 字段 */
export interface CaseItemMetaParsed {
  client?: string;
  category?: string;
  date?: string;
  tags?: string[];
}

export function parseCaseItemMeta(
  raw: string | null | undefined
): CaseItemMetaParsed {
  if (!raw?.trim()) return {};
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const tags = o.tags;
    return {
      client: typeof o.client === 'string' ? o.client : undefined,
      category: typeof o.category === 'string' ? o.category : undefined,
      date: typeof o.date === 'string' ? o.date : undefined,
      tags: Array.isArray(tags)
        ? tags.filter((t): t is string => typeof t === 'string')
        : undefined,
    };
  } catch {
    return {};
  }
}

export function assetsInGroup(
  list: SiteAssetDTO[],
  groupKey: string
): SiteAssetDTO[] {
  return list
    .filter((a) => a.groupKey === groupKey)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchSiteAssetsByPage(
  page: string
): Promise<SiteAssetDTO[]> {
  const body = await axiosInstance.get('/site-assets', { params: { page } });
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: unknown[] }).data
      .map(parseSiteAssetDto)
      .filter((x): x is SiteAssetDTO => x != null);
  }
  return [];
}

export type HomeStatRow = {
  label: string;
  value: number;
  color: string;
};

const DEFAULT_STAT_COLOR = 'var(--app-accent-cinnabar)';

/** 首页 `stats_metric`：`title`=标签，`meta` JSON `{ "value": number, "color"?: string }` */
export function parseHomeStatRow(asset: SiteAssetDTO): HomeStatRow | null {
  const label = asset.title?.trim();
  if (!label) return null;
  let value = 0;
  let color = DEFAULT_STAT_COLOR;
  if (asset.meta?.trim()) {
    try {
      const m = JSON.parse(asset.meta) as {
        value?: unknown;
        color?: unknown;
      };
      if (typeof m.value === 'number' && Number.isFinite(m.value)) {
        value = m.value;
      }
      if (typeof m.color === 'string' && m.color.trim()) {
        color = m.color.trim();
      }
    } catch {
      /* ignore */
    }
  }
  return { label, value, color };
}

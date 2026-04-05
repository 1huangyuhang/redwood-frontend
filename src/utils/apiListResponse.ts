import type { AxiosInstance } from 'axios';

/**
 * 统一解析列表接口：拦截器已返回 response.data，形态多为 { data: T[], pagination? }。
 */
export function extractPaginatedList<T>(body: unknown): T[] {
  if (Array.isArray(body)) {
    return body as T[];
  }
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return (body as { data: T[] }).data;
  }
  return [];
}

function getTotalPages(body: unknown): number {
  if (!body || typeof body !== 'object' || !('pagination' in body)) {
    return 1;
  }
  const p = (body as { pagination?: { totalPages?: number } }).pagination;
  const n = p?.totalPages;
  return typeof n === 'number' && n > 0 ? n : 1;
}

/**
 * 拉取分页列表的全部页（后端单页最大 100 条）。管理后台上传的多条记录会全部出现在前台。
 */
export async function fetchAllPaginatedList<T>(
  client: AxiosInstance,
  path: string,
  extraParams: Record<string, string | number> = {}
): Promise<T[]> {
  const pageSize = 100;
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const body = await client.get(path, {
      params: { ...extraParams, page, pageSize },
    });
    all.push(...extractPaginatedList<T>(body));
    totalPages = getTotalPages(body);
    page += 1;
  } while (page <= totalPages);

  return all;
}

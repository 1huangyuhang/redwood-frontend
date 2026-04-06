/** 与产品列表 URL 约定一致，供活动/新闻/课程/套餐等复用 */

export const ADMIN_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** 内容运营类列表统一默认每页条数（无 URL 参数时） */
export const ADMIN_LIST_DEFAULT_PAGE_SIZE = 20;

/** 供 Ant Design Pagination / Table.pagination.pageSizeOptions 使用 */
export const ADMIN_LIST_PAGE_SIZE_OPTIONS_STR: string[] =
  ADMIN_LIST_PAGE_SIZE_OPTIONS.map(String);

export type AdminListUrlParams = {
  page: number;
  pageSize: number;
  search: string;
};

export function parseAdminListUrlParams(
  searchParams: URLSearchParams
): AdminListUrlParams {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rawPs = Number(searchParams.get('pageSize'));
  const pageSize = ADMIN_LIST_PAGE_SIZE_OPTIONS.includes(
    rawPs as (typeof ADMIN_LIST_PAGE_SIZE_OPTIONS)[number]
  )
    ? rawPs
    : ADMIN_LIST_DEFAULT_PAGE_SIZE;
  const search = searchParams.get('search')?.trim() ?? '';
  return { page, pageSize, search };
}

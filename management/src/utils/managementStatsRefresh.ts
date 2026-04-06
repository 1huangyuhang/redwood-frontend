/** 与 AdminWorkbenchBar 等组件约定：刷新顶栏 /stats/summary 角标 */
export const MGMT_STATS_SUMMARY_REFRESH = 'mgmt-stats-summary-refresh';

export function emitMgmtStatsSummaryRefresh(): void {
  window.dispatchEvent(new CustomEvent(MGMT_STATS_SUMMARY_REFRESH));
}

/** 登录页「返回官网」；生产请在环境变量中配置 */
export function getPublicSiteUrl(): string {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:5173';
  return '';
}

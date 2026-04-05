/**
 * 与后端 MANAGEMENT_USER_READONLY=1 对齐：前端在 VITE_MANAGEMENT_USER_READONLY=1 时
 * 对 USER 角色隐藏写入类按钮（须与后端同时开启，避免「点了才 403」）。
 */
export function canWriteInManagementUi(): boolean {
  if (import.meta.env.VITE_MANAGEMENT_USER_READONLY !== '1') {
    return true;
  }
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;
  if (!token) {
    return false;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { role?: string };
    return payload.role !== 'USER';
  } catch {
    return false;
  }
}

import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { roleCanAccessManagement } from '@/config/managementRoles';

function decodePayload(token: string): { role?: string; exp?: number } | null {
  try {
    const b64 = token.split('.')[1];
    if (!b64) return null;
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { role?: string; exp?: number };
  } catch {
    return null;
  }
}

/**
 * 需本地存在未过期 JWT，且角色符合 VITE_MANAGEMENT_JWT_ROLES（须与后端 MANAGEMENT_JWT_ROLES 一致）。
 */
const RequireManagementAuth = () => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');

  const allowed = useMemo(() => {
    if (!token) return false;
    const p = decodePayload(token);
    if (!p?.exp || p.exp * 1000 < Date.now()) return false;
    if (!p.role) return false;
    return roleCanAccessManagement(p.role);
  }, [token]);

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default RequireManagementAuth;

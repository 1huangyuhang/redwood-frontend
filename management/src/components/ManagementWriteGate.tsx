import React from 'react';
import { canWriteInManagementUi } from '@/utils/managementWriteAccess';

/** 只读模式下（VITE_MANAGEMENT_USER_READONLY=1 且 JWT 为 USER）不渲染子节点 */
const ManagementWriteGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!canWriteInManagementUi()) {
    return null;
  }
  return <>{children}</>;
};

export default ManagementWriteGate;

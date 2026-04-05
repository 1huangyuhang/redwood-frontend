import React from 'react';
import { Skeleton } from 'antd';

/** 路由懒加载时的整页占位，与列表页 Table loading 区分 */
const ManagementRouteFallback: React.FC = () => (
  <div className="admin-page" style={{ padding: '24px 0' }}>
    <Skeleton active paragraph={{ rows: 10 }} />
  </div>
);

export default ManagementRouteFallback;

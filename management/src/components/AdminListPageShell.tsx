import React from 'react';

export type AdminListPageShellProps = {
  title: string;
  description?: string;
  /** 右上主操作区，如「新增」按钮 */
  extra?: React.ReactNode;
  /** 筛选条（折叠表单项、快捷筛选等） */
  filter?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * B 端列表页统一骨架：标题区 + 可选筛选 + 表格/分页等内容区。
 */
const AdminListPageShell: React.FC<AdminListPageShellProps> = ({
  title,
  description,
  extra,
  filter,
  children,
}) => {
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div className="admin-page__title-wrap">
          <h1 className="admin-page__title">{title}</h1>
          {description ? (
            <p className="admin-page__desc">{description}</p>
          ) : null}
        </div>
        {extra ? <div className="admin-page__toolbar">{extra}</div> : null}
      </div>
      {filter ? <div className="admin-page__filter">{filter}</div> : null}
      {children}
    </div>
  );
};

export default AdminListPageShell;

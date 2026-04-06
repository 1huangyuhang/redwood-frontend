import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Tag, message, Modal } from 'antd';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';
import { parsePaginatedList } from '../types/api';
import { emitMgmtStatsSummaryRefresh } from '@/utils/managementStatsRefresh';

interface Row {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

const ContactMessages: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const mapRow = (item: Record<string, unknown>): Row => ({
    id: Number(item.id),
    name: String(item.name ?? ''),
    phone: String(item.phone ?? ''),
    email: String(item.email ?? ''),
    company: item.company != null ? String(item.company) : null,
    subject: item.subject != null ? String(item.subject) : null,
    message: String(item.message ?? ''),
    read: Boolean(item.read),
    createdAt:
      typeof item.createdAt === 'string'
        ? item.createdAt
        : new Date(String(item.createdAt)).toISOString(),
  });

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await axiosInstance.get('/contact-messages', {
        params: { page, pageSize, unreadOnly: unreadOnly ? 'true' : undefined },
      });
      const { list, total: t } =
        parsePaginatedList<Record<string, unknown>>(res);
      setRows(list.map(mapRow));
      setTotal(t);
    } catch (e) {
      message.error('加载留言失败');
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => {
      apiCache.clear();
      emitMgmtStatsSummaryRefresh();
      void load();
    };
    wsService.on('contactMessage:created', onChange);
    wsService.on('contactMessage:deleted', onChange);
    return () => {
      wsService.off('contactMessage:created', onChange);
      wsService.off('contactMessage:deleted', onChange);
    };
  }, [load]);

  const markRead = async (id: number) => {
    try {
      await axiosInstance.patch(`/contact-messages/${id}/read`);
      message.success('已标为已读');
      emitMgmtStatsSummaryRefresh();
      void load();
    } catch {
      message.error('操作失败');
    }
  };

  const remove = (id: number) => {
    Modal.confirm({
      title: '删除该条留言？',
      onOk: async () => {
        await axiosInstance.delete(`/contact-messages/${id}`);
        message.success('已删除');
        apiCache.clear();
        emitMgmtStatsSummaryRefresh();
        void load();
      },
    });
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'read',
      width: 88,
      render: (r: boolean) =>
        r ? (
          <Tag color="default">已读</Tag>
        ) : (
          <Tag color="processing">未读</Tag>
        ),
    },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '电话', dataIndex: 'phone', width: 120 },
    { title: '邮箱', dataIndex: 'email', ellipsis: true },
    {
      title: '主旨',
      dataIndex: 'subject',
      ellipsis: true,
      render: (t: string | null) => t || '—',
    },
    {
      title: '内容',
      dataIndex: 'message',
      ellipsis: true,
      render: (t: string) => (t.length > 60 ? `${t.slice(0, 60)}…` : t),
    },
    { title: '时间', dataIndex: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'act',
      width: 160,
      render: (_: unknown, r: Row) => (
        <ManagementWriteGate>
          <>
            {!r.read ? (
              <Button
                type="link"
                size="small"
                onClick={() => void markRead(r.id)}
              >
                标为已读
              </Button>
            ) : null}
            <Button
              type="link"
              danger
              size="small"
              onClick={() => remove(r.id)}
            >
              删除
            </Button>
          </>
        </ManagementWriteGate>
      ),
    },
  ];

  return (
    <AdminListPageShell
      title="联系留言"
      description="前台「联系我们」表单提交的留言，可标已读或删除。"
      extra={
        <Button
          type={unreadOnly ? 'primary' : 'default'}
          onClick={() => setUnreadOnly((v) => !v)}
        >
          {unreadOnly ? '查看全部' : '仅未读'}
        </Button>
      }
    >
      <div className="admin-table-card">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          loading={listLoading}
          scroll={{ x: 'max-content' }}
        />
      </div>
      <div className="admin-pagination-wrap">
        <EnhancedPagination
          currentPage={page}
          pageSize={pageSize}
          total={total}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>
    </AdminListPageShell>
  );
};

export default ContactMessages;

import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Upload,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import wsService from '../services/websocket';
import EnhancedPagination from '../components/EnhancedPagination';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';
import { parsePaginatedList } from '../types/api';
import { processImageUrl } from '../utils/imageUtils';

interface CourseRow {
  id: number;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  description: string;
  image: string | null;
  tags: string[];
  sortOrder: number;
}

const CourseManagement: React.FC = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [form] = Form.useForm();
  const [listLoading, setListLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const mapRow = (item: Record<string, unknown>): CourseRow => ({
    id: Number(item.id),
    title: String(item.title ?? ''),
    instructor: String(item.instructor ?? ''),
    category: String(item.category ?? ''),
    duration: String(item.duration ?? ''),
    students: Number(item.students ?? 0),
    rating: Number(item.rating ?? 0),
    price: Number(item.price ?? 0),
    description: String(item.description ?? ''),
    image: item.image != null ? String(item.image) : null,
    tags: Array.isArray(item.tags)
      ? (item.tags as unknown[]).filter(
          (t): t is string => typeof t === 'string'
        )
      : [],
    sortOrder: Number(item.sortOrder ?? 0),
  });

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await axiosInstance.get('/courses', {
        params: { page, pageSize },
      });
      const { list, total: t } =
        parsePaginatedList<Record<string, unknown>>(res);
      setRows(list.map(mapRow));
      setTotal(t);
    } catch (e) {
      message.error('加载课程失败');
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => {
      apiCache.clear();
      void load();
    };
    wsService.on('course:created', onChange);
    wsService.on('course:updated', onChange);
    wsService.on('course:deleted', onChange);
    return () => {
      wsService.off('course:created', onChange);
      wsService.off('course:updated', onChange);
      wsService.off('course:deleted', onChange);
    };
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({
      students: 0,
      rating: 4.5,
      sortOrder: 0,
      tagsJson: '["标签一","标签二"]',
    });
    setModalOpen(true);
  };

  const openEdit = (r: CourseRow) => {
    setEditing(r);
    setFileList([]);
    form.setFieldsValue({
      title: r.title,
      instructor: r.instructor,
      category: r.category,
      duration: r.duration,
      students: r.students,
      rating: r.rating,
      price: r.price,
      description: r.description,
      sortOrder: r.sortOrder,
      tagsJson: JSON.stringify(r.tags.length ? r.tags : ['标签']),
    });
    setModalOpen(true);
  };

  const submit = async () => {
    try {
      const v = await form.validateFields();
      setSubmitLoading(true);
      const fd = new FormData();
      fd.append('title', v.title);
      fd.append('instructor', v.instructor);
      fd.append('category', v.category);
      fd.append('duration', v.duration);
      fd.append('students', String(v.students ?? 0));
      fd.append('rating', String(v.rating ?? 0));
      fd.append('price', String(v.price));
      fd.append('description', v.description);
      fd.append('sortOrder', String(v.sortOrder ?? 0));
      const tagsStr = String(v.tagsJson ?? '[]').trim();
      try {
        JSON.parse(tagsStr);
      } catch {
        message.error('标签须为合法 JSON 数组，例如 ["a","b"]');
        setSubmitLoading(false);
        return;
      }
      fd.append('tags', tagsStr);
      const f = fileList[0]?.originFileObj;
      if (f) fd.append('image', f);

      if (editing) {
        await axiosInstance.put(`/courses/${editing.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已更新');
      } else {
        await axiosInstance.post('/courses', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已创建');
      }
      apiCache.clear();
      setModalOpen(false);
      void load();
    } catch (e) {
      console.error(e);
      message.error('保存失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除该课程？',
      onOk: async () => {
        await axiosInstance.delete(`/courses/${id}`);
        message.success('已删除');
        apiCache.clear();
        void load();
      },
    });
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '讲师', dataIndex: 'instructor', key: 'instructor', width: 100 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
    { title: '周期', dataIndex: 'duration', key: 'duration', width: 80 },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 90,
      render: (p: number) => `¥${Number(p).toFixed(0)}`,
    },
    {
      title: '封面',
      key: 'img',
      width: 72,
      render: (_: unknown, r: CourseRow) =>
        r.image ? (
          <img
            src={processImageUrl(r.image)}
            alt=""
            style={{
              width: 48,
              height: 32,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: '操作',
      key: 'act',
      width: 160,
      render: (_: unknown, r: CourseRow) => (
        <ManagementWriteGate>
          <>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openEdit(r)}
            >
              编辑
            </Button>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r.id)}
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
      title="课程管理"
      description="维护前台课程列表、封面与标签，与站点课程页数据源一致。"
      extra={
        <ManagementWriteGate>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建课程
          </Button>
        </ManagementWriteGate>
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

      <Modal
        title={editing ? '编辑课程' : '新建课程'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void submit()}
        confirmLoading={submitLoading}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" scrollToFirstError>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="instructor"
            label="讲师"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="周期" rules={[{ required: true }]}>
            <Input placeholder="如 8周" />
          </Form.Item>
          <Form.Item name="students" label="学习人数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rating" label="评分 0–5">
            <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序（小在前）">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="tagsJson"
            label="标签（JSON 数组字符串）"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder='["标签1","标签2"]' />
          </Form.Item>
          <Form.Item label="封面图（可选）">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              maxCount={1}
              accept="image/*"
            >
              <Button>选择图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </AdminListPageShell>
  );
};

export default CourseManagement;

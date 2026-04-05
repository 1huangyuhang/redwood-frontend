import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Upload,
  Image,
  Tag,
  Tabs,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axiosInstance, { apiCache } from '../services/axiosInstance';
import { formatManagementListLoadError } from '../utils/managementLoadErrorHint';
import { processImageUrl } from '../utils/imageUtils';
import AdminListPageShell from '../components/AdminListPageShell';
import ManagementWriteGate from '../components/ManagementWriteGate';

const { TextArea } = Input;

interface SiteAssetRow {
  id: number;
  page: string;
  groupKey: string;
  sortOrder: number;
  title: string | null;
  alt: string | null;
  content: string | null;
  meta: string | null;
  image: string | null;
  videoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const SiteAssetManagement: React.FC = () => {
  const [rows, setRows] = useState<SiteAssetRow[]>([]);
  const [pageTab, setPageTab] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SiteAssetRow | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/site-assets');
      const data = Array.isArray((res as { data?: unknown }).data)
        ? (res as { data: SiteAssetRow[] }).data
        : [];
      setRows(data);
    } catch (e) {
      message.error({
        key: 'mgmt-site-assets-load',
        content: formatManagementListLoadError(e, '站点素材'),
        duration: 8,
      });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pageKeys = useMemo(
    () => [...new Set(rows.map((r) => r.page))].sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (pageTab === 'all') return rows;
    return rows.filter((r) => r.page === pageTab);
  }, [rows, pageTab]);

  const tabItems = useMemo(
    () => [
      { key: 'all', label: `全部（${rows.length}）` },
      ...pageKeys.map((p) => ({
        key: p,
        label: `${p}（${rows.filter((r) => r.page === p).length}）`,
      })),
    ],
    [rows, pageKeys]
  );

  useEffect(() => {
    if (pageTab !== 'all' && !pageKeys.includes(pageTab)) {
      setPageTab('all');
    }
  }, [pageKeys, pageTab]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({ sortOrder: 0, imageUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (record: SiteAssetRow) => {
    setEditing(record);
    form.setFieldsValue({
      page: record.page,
      groupKey: record.groupKey,
      sortOrder: record.sortOrder,
      title: record.title ?? '',
      alt: record.alt ?? '',
      content: record.content ?? '',
      meta: record.meta ?? '',
      videoUrl: record.videoUrl ?? '',
      imageUrl: '',
    });
    setFileList([]);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除该条站点素材？',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/site-assets/${id}`);
          message.success('已删除');
          apiCache.clear();
          await load();
        } catch (e) {
          message.error('删除失败');
          console.error(e);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const rawFile = fileList[0]?.originFileObj;
      const imageUrl = String(values.imageUrl ?? '').trim();
      const hasContent = String(values.content ?? '').trim().length > 0;
      const hasVideo = String(values.videoUrl ?? '').trim().length > 0;

      if (
        !editing &&
        !(rawFile instanceof File) &&
        !imageUrl &&
        !hasVideo &&
        !hasContent
      ) {
        message.warning(
          '请至少：填写可访问的图片 URL、或上传图片、或填写视频地址、或填写正文'
        );
        setSubmitting(false);
        return;
      }

      if (!editing && imageUrl && !(rawFile instanceof File)) {
        await axiosInstance.post('/site-assets/import-url', {
          page: values.page,
          groupKey: values.groupKey,
          sortOrder: values.sortOrder ?? 0,
          title: values.title || undefined,
          alt: values.alt || undefined,
          content: values.content || undefined,
          meta: values.meta || undefined,
          videoUrl: values.videoUrl || undefined,
          imageUrl,
        });
        message.success('已从 URL 创建素材');
        apiCache.clear();
        setModalOpen(false);
        await load();
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('page', values.page);
      formData.append('groupKey', values.groupKey);
      formData.append('sortOrder', String(values.sortOrder ?? 0));
      if (values.title != null && values.title !== '') {
        formData.append('title', values.title);
      }
      if (values.alt != null && values.alt !== '') {
        formData.append('alt', values.alt);
      }
      if (values.videoUrl != null && values.videoUrl !== '') {
        formData.append('videoUrl', values.videoUrl);
      }
      if (values.content != null && String(values.content).trim() !== '') {
        formData.append('content', String(values.content));
      }
      if (values.meta != null && String(values.meta).trim() !== '') {
        formData.append('meta', String(values.meta));
      }
      if (rawFile instanceof File) {
        formData.append('image', rawFile);
      }

      if (!editing && !(rawFile instanceof File) && !hasVideo && !hasContent) {
        message.warning(
          '请至少上传图片、填写视频地址或填写正文（成功案例/关于页文案可仅用正文）'
        );
        setSubmitting(false);
        return;
      }

      if (editing) {
        await axiosInstance.put(`/site-assets/${editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已更新');
      } else {
        await axiosInstance.post('/site-assets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('已创建');
      }
      apiCache.clear();
      setModalOpen(false);
      await load();
    } catch (e) {
      if ((e as { errorFields?: unknown })?.errorFields) return;
      message.error('保存失败');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 64,
    },
    {
      title: '页面',
      dataIndex: 'page',
      width: 100,
      render: (t: string) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: '分组',
      dataIndex: 'groupKey',
      width: 140,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 72,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (t: string | null) => t || '—',
    },
    {
      title: '预览',
      dataIndex: 'image',
      width: 96,
      render: (img: string | null) =>
        img ? (
          <Image
            width={56}
            height={56}
            src={processImageUrl(img)}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: '视频',
      dataIndex: 'videoUrl',
      ellipsis: true,
      render: (u: string | null) => u || '—',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: SiteAssetRow) => (
        <ManagementWriteGate>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              删除
            </Button>
          </div>
        </ManagementWriteGate>
      ),
    },
  ];

  return (
    <AdminListPageShell
      title="站点素材"
      description="维护首页、关于页、成功案例、顶栏 Logo 等素材。支持本地上传与公网图片 URL 导入。关于页/案例正文写在「正文」；案例可填扩展 JSON。"
      extra={
        <ManagementWriteGate>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增素材
          </Button>
        </ManagementWriteGate>
      }
      filter={
        <Tabs
          activeKey={pageTab}
          onChange={setPageTab}
          items={tabItems}
          size="small"
          type="card"
        />
      }
    >
      <div className="admin-table-card">
        <Table<SiteAssetRow>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 960 }}
        />
      </div>

      <Modal
        title={editing ? '编辑站点素材' : '新增站点素材'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={submitting}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" scrollToFirstError>
          <Form.Item
            name="page"
            label="页面标识 page"
            rules={[{ required: true, message: '例如 home / about / layout' }]}
          >
            <Input placeholder="home | about | layout" />
          </Form.Item>
          <Form.Item
            name="groupKey"
            label="分组 groupKey"
            rules={[{ required: true, message: '例如 top_gallery、header' }]}
          >
            <Input placeholder="top_gallery | product_categories | header …" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序 sortOrder">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="title" label="标题（可选，如产品系列名称）">
            <Input />
          </Form.Item>
          <Form.Item name="alt" label="图片 alt 文案">
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="正文 content（关于页段落、案例描述等）"
          >
            <TextArea
              rows={5}
              placeholder="支持多段纯文本，前台按分组与排序展示"
            />
          </Form.Item>
          <Form.Item
            name="meta"
            label="扩展 JSON（可选，用于成功案例 case_item）"
            extra='示例：{"client":"客户名","category":"分类","date":"2024-01-01","tags":["标签1"]}'
          >
            <TextArea
              rows={3}
              placeholder='{"client":"","category":"","date":"","tags":[]}'
            />
          </Form.Item>
          <Form.Item name="videoUrl" label="视频地址（可选，如首页滚动区）">
            <Input placeholder="https://…" />
          </Form.Item>
          {!editing ? (
            <Form.Item
              name="imageUrl"
              label="图片 URL（可选，与下方上传二选一）"
              extra="示例：https://picsum.photos/id/1018/1200/800 — 由服务端下载并存储"
            >
              <Input placeholder="https://…" allowClear />
            </Form.Item>
          ) : (
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              编辑时如需换图请使用下方上传；或使用删除后通过「新增」从 URL
              导入。
            </p>
          )}
          <Form.Item label="图片文件（可选）">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false}
              maxCount={1}
              onChange={({ fileList: fl }) => setFileList(fl)}
            >
              <Button type="default">选择图片</Button>
            </Upload>
            {editing ? (
              <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                不选择文件则保留原图
              </div>
            ) : null}
          </Form.Item>
        </Form>
      </Modal>
    </AdminListPageShell>
  );
};

export default SiteAssetManagement;

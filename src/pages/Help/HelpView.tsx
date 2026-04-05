import { useState } from 'react';
import { Card, Form, Input, Button, Upload, message } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axiosInstance from '@/services/api/axiosInstance';

const { TextArea } = Input;

export default function HelpView() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('文件大小不能超过5MB!');
      return Upload.LIST_IGNORE;
    }
    setAttachmentFile(file);
    setAttachmentName(file.name);
    return false;
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName('');
  };

  const handleSubmit = async (values: {
    fullName: string;
    phoneNumber?: string;
    emailAddress: string;
    companyName?: string;
    messageSubject: string;
    askYourQuestion: string;
  }) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', values.fullName.trim());
      if (values.phoneNumber?.trim()) {
        fd.append('phoneNumber', values.phoneNumber.trim());
      }
      fd.append('emailAddress', values.emailAddress.trim());
      if (values.companyName?.trim()) {
        fd.append('companyName', values.companyName.trim());
      }
      fd.append('messageSubject', values.messageSubject.trim());
      fd.append('askYourQuestion', values.askYourQuestion.trim());
      if (attachmentFile) {
        fd.append('attachment', attachmentFile);
      }

      const data = (await axiosInstance.post('/support-tickets', fd)) as {
        message?: string;
      };
      message.success(
        data?.message || '工单已提交，我们将在工作日内与您联系。'
      );
      form.resetFields();
      handleRemoveAttachment();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败，请稍后重试';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="ticket-form-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) => void handleSubmit(v)}
        requiredMark="optional"
      >
        <Form.Item
          name="fullName"
          label="姓名"
          rules={[{ required: true, message: '请输入您的姓名' }]}
        >
          <Input placeholder="请输入您的姓名" />
        </Form.Item>

        <Form.Item name="phoneNumber" label="电话号码">
          <Input placeholder="+86 13800138000" />
        </Form.Item>

        <Form.Item
          name="emailAddress"
          label="邮箱地址"
          rules={[
            { required: true, message: '请输入您的邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input placeholder="请输入您的邮箱地址" />
        </Form.Item>

        <Form.Item name="companyName" label="公司名称">
          <Input placeholder="请输入您的公司名称" />
        </Form.Item>

        <Form.Item
          name="messageSubject"
          label="主题"
          rules={[{ required: true, message: '请输入主题' }]}
        >
          <Input placeholder="请输入您的问题主题" />
        </Form.Item>

        <Form.Item
          name="askYourQuestion"
          label="您的问题"
          rules={[{ required: true, message: '请输入您的问题' }]}
        >
          <TextArea placeholder="请详细描述您的问题" rows={6} />
        </Form.Item>

        <Form.Item label="附件（可选）">
          <Upload
            beforeUpload={beforeUpload}
            onRemove={handleRemoveAttachment}
            maxCount={1}
            fileList={
              attachmentFile
                ? [
                    {
                      uid: '-1',
                      name: attachmentName,
                      status: 'done',
                    },
                  ]
                : []
            }
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
          {!attachmentFile && (
            <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
              未选择任何文件
            </span>
          )}
        </Form.Item>

        <Form.Item>
          <SiteButton
            variant="primary"
            type="submit"
            className="submit-btn"
            loading={submitting}
          >
            提交工单
          </SiteButton>
        </Form.Item>
      </Form>
    </Card>
  );
}

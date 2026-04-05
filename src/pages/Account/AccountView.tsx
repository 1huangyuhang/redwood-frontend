import { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Avatar,
  Alert,
  Space,
  Divider,
  message,
} from 'antd';
import {
  UserOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/redux/store';
import { updateUserInfo } from '@/redux/slices/userSlice';

const { Title, Text } = Typography;

export default function AccountView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((s: RootState) => s.user);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyActivity, setNotifyActivity] = useState(true);
  const [notifySystem, setNotifySystem] = useState(false);

  useEffect(() => {
    if (userInfo) {
      profileForm.setFieldsValue({
        name: userInfo.name,
        email: userInfo.email,
        phone: '',
      });
    }
  }, [userInfo, profileForm]);

  const onSaveProfile = (values: {
    name: string;
    email: string;
    phone?: string;
  }) => {
    if (!userInfo) return;
    dispatch(
      updateUserInfo({
        ...userInfo,
        name: values.name.trim(),
        email: values.email.trim(),
      })
    );
    message.success('资料已保存');
  };

  const onChangePassword = () => {
    passwordForm.resetFields();
    message.success('密码已更新（演示，未连接服务器）');
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> 基本资料
        </span>
      ),
      children: (
        <Card className="account-panel-card" bordered={false}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={onSaveProfile}
            requiredMark="optional"
            disabled={!isAuthenticated || !userInfo}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="显示名称"
                  rules={[{ required: true, message: '请输入显示名称' }]}
                >
                  <Input placeholder="您的称呼" maxLength={40} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="电子邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '邮箱格式不正确' },
                  ]}
                >
                  <Input placeholder="name@example.com" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="phone" label="手机号码">
              <Input placeholder="选填，用于安全验证与通知" maxLength={20} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isAuthenticated || !userInfo}
              >
                保存资料
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyCertificateOutlined /> 安全设置
        </span>
      ),
      children: (
        <Card className="account-panel-card" bordered={false}>
          <Text type="secondary" className="account-panel-hint">
            修改密码前请确认当前账号已登录。以下为演示流程，不会真实请求后端。
          </Text>
          <Divider className="account-divider" />
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={onChangePassword}
            disabled={!isAuthenticated}
          >
            <Form.Item
              name="current"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password
                placeholder="当前密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item
              name="next"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '至少 8 位字符' },
              ]}
            >
              <Input.Password
                placeholder="新密码"
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="确认新密码"
              dependencies={['next']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('next') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="确认新密码"
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isAuthenticated}
              >
                更新密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notify',
      label: (
        <span>
          <BellOutlined /> 通知偏好
        </span>
      ),
      children: (
        <Card className="account-panel-card" bordered={false}>
          <Space
            direction="vertical"
            size="large"
            className="account-notify-list"
          >
            <div className="account-notify-row">
              <div>
                <Text strong>邮件通知</Text>
                <br />
                <Text type="secondary">订单、安全与重要系统邮件</Text>
              </div>
              <Switch
                checked={notifyEmail}
                onChange={setNotifyEmail}
                disabled={!isAuthenticated}
              />
            </div>
            <div className="account-notify-row">
              <div>
                <Text strong>活动与推荐</Text>
                <br />
                <Text type="secondary">新课程、促销与个性化推荐</Text>
              </div>
              <Switch
                checked={notifyActivity}
                onChange={setNotifyActivity}
                disabled={!isAuthenticated}
              />
            </div>
            <div className="account-notify-row">
              <div>
                <Text strong>系统公告</Text>
                <br />
                <Text type="secondary">维护计划与产品更新说明</Text>
              </div>
              <Switch
                checked={notifySystem}
                onChange={setNotifySystem}
                disabled={!isAuthenticated}
              />
            </div>
          </Space>
          <Divider />
          <Text type="secondary" className="account-panel-hint">
            偏好将保存在本机浏览器会话中（演示）；接入后端后可同步到账号。
          </Text>
        </Card>
      ),
    },
  ];

  return (
    <>
      {!isAuthenticated ? (
        <Alert
          className="account-alert"
          type="info"
          showIcon
          message="您尚未登录"
          description="登录后可编辑资料、修改密码并管理通知。若仅浏览站点，也可稍后再登录。"
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => navigate('/login')}
            >
              去登录
            </Button>
          }
        />
      ) : null}

      <Card className="account-summary-card" bordered={false}>
        <Row gutter={[24, 16]} align="middle">
          <Col>
            <Avatar
              size={72}
              icon={<UserOutlined />}
              className="account-avatar"
            >
              {userInfo?.name?.charAt(0)}
            </Avatar>
          </Col>
          <Col flex="1">
            <Title level={4} className="account-summary-name">
              {userInfo?.name ?? '访客'}
            </Title>
            <Space wrap size={[8, 8]}>
              <Text type="secondary">{userInfo?.email ?? '—'}</Text>
              {userInfo?.role ? (
                <Text type="secondary">· {userInfo.role}</Text>
              ) : null}
            </Space>
          </Col>
          <Col xs={24} md="auto">
            <Button onClick={() => navigate('/applications')}>应用程序</Button>
          </Col>
        </Row>
      </Card>

      <Tabs
        defaultActiveKey="profile"
        items={tabItems}
        className="account-tabs"
      />
    </>
  );
}

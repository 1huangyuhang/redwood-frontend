import { useState } from 'react';
import { Card, Form, Input, Button, message, Collapse, Typography } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '@/services/axiosInstance';
import type { AuthSuccessResponse } from '../../../src/types/auth';
import { roleCanAccessManagement } from '@/config/managementRoles';
import { getAuthApiErrorMessage } from '@/utils/authApiErrorMessage';
import { getPublicSiteUrl } from '@/utils/publicSiteUrl';
import { ErrorCodes, isTraceableError } from '@shared/errorTracing';
import {
  getBackendUnreachableHint,
  isBackendUnreachableError,
} from '../../../src/utils/backendConnection';
import '@/styles/admin-shell.less';
import '@/styles/management-login.less';

const { Paragraph } = Typography;

const ManagementLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const publicSite = getPublicSiteUrl();

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from?: string }).from !== '/login'
      ? (location.state as { from: string }).from
      : '/';

  const onFinish = async (values: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      const data = (await axiosInstance.post('/auth/login', {
        identifier: values.identifier.trim(),
        password: values.password,
      })) as AuthSuccessResponse;

      if (!roleCanAccessManagement(data.user.role)) {
        message.error(
          import.meta.env.DEV
            ? '当前角色无权进入后台。请在 VITE_MANAGEMENT_JWT_ROLES 与后端 MANAGEMENT_JWT_ROLES 中同时包含该角色。'
            : '当前账号无权进入管理后台，请联系管理员。'
        );
        return;
      }

      localStorage.setItem('authToken', data.token);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      if (typeof error === 'string') {
        message.error(error);
        return;
      }
      if (isTraceableError(error)) {
        if (
          error.errorCode === ErrorCodes.NET_NO_RESPONSE ||
          error.errorCode === ErrorCodes.NET_TIMEOUT
        ) {
          message.error(getBackendUnreachableHint());
        } else {
          message.error(error.message);
        }
        return;
      }
      if (axios.isAxiosError(error)) {
        if (isBackendUnreachableError(error)) {
          message.error(getBackendUnreachableHint());
        } else {
          message.error(
            getAuthApiErrorMessage(
              error.response?.data,
              '登录失败，请检查账号和密码'
            )
          );
        }
        return;
      }
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mgmt-login">
      <aside className="mgmt-login__brand" aria-hidden>
        <div className="mgmt-login__brand-inner">
          <div className="mgmt-login__mark" aria-hidden>
            <SafetyCertificateOutlined />
          </div>
          <p className="mgmt-login__eyebrow">内部使用 · 安全登录</p>
          <h2 className="mgmt-login__title">企业运营后台</h2>
          <p className="mgmt-login__lede">
            与官网前台共用账号体系。请使用已授权角色登录；会话采用
            JWT，请勿在公共设备保存密码。
          </p>
        </div>
      </aside>

      <main className="mgmt-login__panel">
        <div className="mgmt-login__panel-inner">
          <Card className="mgmt-login__card" bordered={false}>
            <header className="mgmt-login__card-head">
              <h1>管理员登录</h1>
              <p>使用官网注册邮箱或用户名与密码</p>
            </header>

            <Collapse
              ghost
              bordered={false}
              className="mgmt-login__collapse"
              items={[
                {
                  key: 'help',
                  label: '权限说明与本地联调',
                  children: (
                    <div>
                      <Paragraph className="mgmt-login__help-text">
                        登录后请求携带 <code>Authorization: Bearer</code>
                        ；角色由服务端 <code>MANAGEMENT_JWT_ROLES</code>{' '}
                        与构建时 <code>VITE_MANAGEMENT_JWT_ROLES</code>{' '}
                        共同约束。若需随请求附带 API Key，可配置{' '}
                        <code>VITE_SEND_X_API_KEY=1</code>（视项目约定）。
                      </Paragraph>
                    </div>
                  ),
                },
              ]}
            />

            <Form
              className="mgmt-login__form"
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label="邮箱或用户名"
                name="identifier"
                rules={[
                  { required: true, message: '请输入邮箱或用户名' },
                  { max: 255, message: '过长' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="注册时使用的邮箱或用户名"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { max: 128, message: '密码过长' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="mgmt-login__submit"
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            {publicSite ? (
              <div className="mgmt-login__footer">
                <a className="mgmt-login__site-link" href={publicSite}>
                  返回官网首页
                </a>
              </div>
            ) : null}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ManagementLogin;

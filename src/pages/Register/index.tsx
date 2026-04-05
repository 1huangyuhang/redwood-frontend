import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '@/services/api/axiosInstance';
import {
  USERNAME_MIN,
  USERNAME_MAX,
  USERNAME_PATTERN,
  RESERVED_USERNAMES,
  getRegisterPasswordError,
  REGISTER_PASSWORD_HINT,
  EMAIL_MAX_LEN,
} from '@/constants/authCredentials';
import { getAuthApiErrorMessage } from '@/utils/authApiErrorMessage';
import {
  getBackendUnreachableHint,
  isBackendUnreachableError,
} from '@/utils/backendConnection';
import { ErrorCodes, isTraceableError } from '@shared/errorTracing';
import type { ApiResponse, RegisterSuccessData } from '@/types/api';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ScrollAnimatedSection } from '@/animations';
import '../Login/index.less';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values: {
    email: string;
    username: string;
    password: string;
    confirm: string;
  }) => {
    if (values.password !== values.confirm) {
      message.error('两次输入的密码不一致');
      return;
    }
    const username = values.username.trim().toLowerCase();
    if (RESERVED_USERNAMES.has(username)) {
      message.error('该用户名为系统保留，请换一个');
      return;
    }
    setLoading(true);
    try {
      const body = (await axiosInstance.post('/auth/register', {
        email: values.email.trim(),
        username,
        password: values.password,
      })) as ApiResponse<RegisterSuccessData>;

      if (body.success) {
        message.success(body.message || '注册成功');
        navigate('/login');
      } else {
        message.error(body.message || '注册失败');
      }
    } catch (error: unknown) {
      if (isTraceableError(error)) {
        if (error.errorCode === ErrorCodes.NET_NO_RESPONSE) {
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
            getAuthApiErrorMessage(error.response?.data, '注册失败，请稍后重试')
          );
        }
        return;
      }
      message.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--premium">
      <div className="login-page__theme-corner">
        <ThemeToggle />
      </div>
      <ScrollAnimatedSection reveal className="login-page__reveal-row">
        <aside className="login-page__brand">
          <div className="login-page__brand-inner">
            <p className="login-page__eyebrow">林之源</p>
            <h1 className="login-page__headline">创建账号</h1>
            <p className="login-page__lede">
              安全密码策略与邮箱验证，与主站体验一致
            </p>
          </div>
        </aside>
        <div className="login-page__panel">
          <div className="login-page__panel-inner">
            <Card className="login-card" bordered={false}>
              <div className="login-card__header">
                <h2>用户注册</h2>
                <p>注册后使用邮箱或用户名登录</p>
              </div>
              <Form
                name="register"
                onFinish={handleRegister}
                className="login-form"
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效邮箱格式' },
                    {
                      validator: async (_, value) => {
                        const s = typeof value === 'string' ? value : '';
                        if (s.length > EMAIL_MAX_LEN) {
                          throw new Error(`邮箱最多 ${EMAIL_MAX_LEN} 个字符`);
                        }
                      },
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="site-form-item-icon" />}
                    placeholder="name@example.com"
                    autoComplete="email"
                    size="large"
                    maxLength={EMAIL_MAX_LEN}
                  />
                </Form.Item>
                <Form.Item
                  label="用户名"
                  name="username"
                  normalize={(v) =>
                    typeof v === 'string' ? v.toLowerCase() : v
                  }
                  rules={[
                    { required: true, message: '请输入用户名' },
                    {
                      min: USERNAME_MIN,
                      message: `至少 ${USERNAME_MIN} 个字符`,
                    },
                    {
                      max: USERNAME_MAX,
                      message: `最多 ${USERNAME_MAX} 个字符`,
                    },
                    {
                      pattern: USERNAME_PATTERN,
                      message: '仅小写字母、数字与下划线',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="小写字母、数字、下划线"
                    autoComplete="username"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="password"
                  extra={
                    <span className="login-form__field-hint">
                      {REGISTER_PASSWORD_HINT}
                    </span>
                  }
                  rules={[
                    {
                      validator: async (_, value) => {
                        const err = getRegisterPasswordError(
                          typeof value === 'string' ? value : ''
                        );
                        if (err) throw new Error(err);
                      },
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="例如 Abcdefgh1"
                    autoComplete="new-password"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  label="确认密码"
                  name="confirm"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请再次输入密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                    loading={loading}
                    block
                    size="large"
                  >
                    注册
                  </Button>
                </Form.Item>
                <div className="login-form__footer">
                  <span>已有账号？</span>
                  <Link to="/login">去登录</Link>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </ScrollAnimatedSection>
    </div>
  );
};

export default Register;

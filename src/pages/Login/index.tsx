import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import axiosInstance from '@/services/api/axiosInstance';
import { loginSuccess } from '@/redux/slices/userSlice';
import type { AuthSuccessResponse } from '@/types/auth';
import { getAuthApiErrorMessage } from '@/utils/authApiErrorMessage';
import {
  getBackendUnreachableHint,
  isBackendUnreachableError,
} from '@/utils/backendConnection';
import { ErrorCodes, isTraceableError } from '@shared/errorTracing';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ScrollAnimatedSection } from '@/animations';
import './index.less';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = location.state as { from?: { pathname?: string } } | null;
  const redirectTo =
    fromState?.from?.pathname && fromState.from.pathname !== '/login'
      ? fromState.from.pathname
      : '/';

  const onFinish = async (values: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      const data = (await axiosInstance.post('/auth/login', {
        identifier: values.identifier.trim(),
        password: values.password,
      })) as AuthSuccessResponse;

      dispatch(
        loginSuccess({
          token: data.token,
          userInfo: {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            role: data.user.role,
          },
        })
      );
      message.success('登录成功');
      navigate(redirectTo, { replace: true });
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
    <div className="login-page login-page--premium">
      <div className="login-page__theme-corner">
        <ThemeToggle />
      </div>
      <ScrollAnimatedSection reveal className="login-page__reveal-row">
        <aside className="login-page__brand" aria-hidden>
          <div className="login-page__brand-inner">
            <p className="login-page__eyebrow">林之源</p>
            <h1 className="login-page__headline">欢迎回来</h1>
            <p className="login-page__lede">
              使用注册时的邮箱或用户名登录，与全站账号、会员中心数据同步。
            </p>
          </div>
        </aside>
        <div className="login-page__panel">
          <div className="login-page__panel-inner">
            <Card className="login-card login-card--premium" bordered={false}>
              <div className="login-card__header">
                <h2>用户登录</h2>
                <p>登录后可使用账户中心、订单与个性化服务</p>
              </div>
              <Form
                name="login"
                className="login-form"
                layout="vertical"
                requiredMark={false}
                onFinish={onFinish}
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
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="注册时使用的邮箱或用户名"
                    autoComplete="username"
                    size="large"
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
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    size="large"
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                    loading={loading}
                    block
                    size="large"
                  >
                    登录
                  </Button>
                </Form.Item>
                <div className="login-form__footer">
                  <span>还没有账号？</span>
                  <Link to="/register">去注册</Link>
                </div>
                <div className="login-form__footer login-form__footer--subtle">
                  <Link to="/">返回首页</Link>
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </ScrollAnimatedSection>
    </div>
  );
};

export default Login;

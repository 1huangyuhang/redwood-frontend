import axios from 'axios';
import { generateTraceRef, wrapAxiosError } from '@shared/errorTracing';

const axiosInstance = axios.create({
  baseURL: '/api', // 使用相对路径，通过vite proxy代理到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const clientTraceId = generateTraceRef('cli');
    (config as { clientTraceId?: string }).clientTraceId = clientTraceId;
    config.headers['X-Client-Trace-Id'] = clientTraceId;

    const apiKey = import.meta.env.VITE_API_KEY || 'default-api-key';
    config.headers['x-api-key'] = apiKey;

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    const te = wrapAxiosError(error);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      // 登录页提交错误账号也会 401，不应整页重定向打断表单提示
      if (!url.includes('/auth/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    const te = wrapAxiosError(error);
    console.error(te.toLogString());
    return Promise.reject(te);
  }
);

export default axiosInstance;

import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Spin } from 'antd';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import store, { type RootState } from './redux/store';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { buildAntdAppTheme } from './config/antdTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppThemed() {
  const mode = useSelector((s: RootState) => s.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ConfigProvider locale={zhCN} theme={buildAntdAppTheme(mode)}>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '40vh',
              }}
            >
              <Spin size="large" />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppThemed />
    </Provider>
  );
}

export default App;

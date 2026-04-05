import type { Preview } from '@storybook/react';
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import '../src/assets/styles/global.less';
import '../src/animations/styles/keyframes.less';
import type { ThemeMode } from '../src/redux/slices/themeSlice';
import { buildAntdAppTheme } from '../src/config/antdTheme';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const mode = (context.globals.theme as ThemeMode) ?? 'light';
      document.documentElement.setAttribute('data-theme', mode);
      return (
        <ConfigProvider locale={zhCN} theme={buildAntdAppTheme(mode)}>
          <div
            style={{
              padding: 24,
              minHeight: '100vh',
              boxSizing: 'border-box',
            }}
          >
            <Story />
          </div>
        </ConfigProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: '与官网一致的亮/暗（data-theme + Ant Design token）',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;

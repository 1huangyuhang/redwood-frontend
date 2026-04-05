import type { Meta, StoryObj } from '@storybook/react';
import { Button, Space } from 'antd';

const meta: Meta = {
  title: 'UI/Ant Design/Button',
  parameters: {
    docs: {
      description: {
        component:
          '与主站 `App` 相同的 `ConfigProvider` + `buildAntdAppTheme`；toolbar 切换亮/暗可对照 token。',
      },
    },
  },
};

export default meta;

export const Variants: StoryObj = {
  render: () => (
    <Space wrap size="middle">
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="link">Link</Button>
      <Button danger>Danger</Button>
      <Button type="primary" disabled>
        Disabled
      </Button>
    </Space>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Space direction="vertical" size="middle">
      <Space wrap>
        <Button type="primary" size="large">
          Large
        </Button>
        <Button type="primary">Middle</Button>
        <Button type="primary" size="small">
          Small
        </Button>
      </Space>
    </Space>
  ),
};

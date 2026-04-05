import type { Meta, StoryObj } from '@storybook/react';
import { ShoppingOutlined } from '@ant-design/icons';
import { SiteButton } from './SiteButton';

const meta: Meta<typeof SiteButton> = {
  title: 'UI/SiteButton',
  component: SiteButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'gradient', 'outline'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'sm'] },
  },
};

export default meta;

type Story = StoryObj<typeof SiteButton>;

export const Primary: Story = {
  args: { children: '主要按钮', variant: 'primary' },
};

export const Gradient: Story = {
  args: { children: '渐变按钮', variant: 'gradient' },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <ShoppingOutlined />
        带图标
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { children: '不可用', variant: 'primary', disabled: true },
};

export const Outline: Story = {
  args: { children: '线框按钮', variant: 'outline' },
};

export const Loading: Story = {
  args: { children: '提交中', variant: 'primary', loading: true },
};

export const Block: Story = {
  args: { children: '撑满宽度', variant: 'primary', block: true },
};

export const Small: Story = {
  args: { children: '重试', variant: 'primary', size: 'sm' },
};

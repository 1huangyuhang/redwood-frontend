import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import './SiteButton.less';

export type SiteButtonVariant = 'primary' | 'gradient' | 'outline';

export interface SiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 主色实心 / 渐变 / 线框（定价卡片非「推荐」档） */
  variant?: SiteButtonVariant;
  loading?: boolean;
  /** 宽度撑满容器（如应用入口卡片） */
  block?: boolean;
  /** 紧凑尺寸（如 Alert 内「重试」） */
  size?: 'default' | 'sm';
  children?: ReactNode;
}

const variantClass: Record<SiteButtonVariant, string> = {
  primary: 'btn-primary',
  gradient: 'btn-gradient',
  outline: 'site-btn-outline',
};

/**
 * 官网营销区按钮：封装全局 `.btn-primary` / `.btn-gradient` 等，便于页面与 Storybook 统一维护。
 */
export function SiteButton({
  variant = 'primary',
  className,
  type = 'button',
  loading = false,
  block = false,
  size = 'default',
  disabled,
  children,
  ...rest
}: SiteButtonProps) {
  const merged = [
    variantClass[variant],
    block ? 'site-btn--block' : '',
    size === 'sm' ? 'site-btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={merged}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <LoadingOutlined spin className="site-btn__spin" aria-hidden />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

import type { ReactNode } from 'react';

export type MarketingPageShellProps = {
  /** 页面根 class，如 contact-page、shop-page（与 Less、ly-mahogany-glass-pages 约定一致） */
  pageClass: string;
  wide?: boolean;
  extraClassName?: string;
  /**
   * 默认首块：`.page-title` 内渲染（玻璃 hero）。
   * 与 `customHeader` 互斥。
   */
  title?: ReactNode;
  lead?: ReactNode;
  /** 自定义首块（如 `.applications-hero`、`.page-header`），不再包默认 hero */
  customHeader?: ReactNode;
  /**
   * 与 title/lead 组合时的首块根 class（玻璃样式见 ly-mahogany-glass-pages）
   * @default 'page-title'
   */
  defaultHeroClass?: 'page-title' | 'page-header' | 'account-page-title';
  children?: ReactNode;
};

/**
 * 营销/内容页统一壳：版心 + 可选玻璃标题区。
 * 工具页（如 Dashboard）不要使用本组件。
 */
export function MarketingPageShell({
  pageClass,
  wide,
  extraClassName,
  title,
  lead,
  customHeader,
  defaultHeroClass = 'page-title',
  children,
}: MarketingPageShellProps) {
  const rootClass = [
    'marketing-page-shell',
    pageClass,
    'ly-container',
    wide ? 'ly-container--wide' : '',
    extraClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const showDefaultHero =
    customHeader == null && (title != null || lead != null);

  return (
    <div className={rootClass}>
      {customHeader}
      {showDefaultHero ? (
        <div className={defaultHeroClass}>
          {title}
          {lead}
        </div>
      ) : null}
      {children}
    </div>
  );
}

import type { ThemeConfig } from 'antd/es/config-provider/context';

/** 与 management/src/styles/tokens.less 中同名语义 hex 保持一致（单一事实来源在 Less，改色请两边同步） */
const ADMIN_BG_CANVAS = '#f3f0ec';
const ADMIN_BG_SURFACE = '#fffcfa';
const ADMIN_BG_MUTED = '#f2ebe5';

/**
 * 管理后台专用浅色主题（与前台暗色 DeFi 风分离）
 */
export const antdManagementTheme: ThemeConfig = {
  token: {
    colorPrimary: '#80322E',
    colorSuccess: '#2f7a45',
    colorWarning: '#b8860b',
    colorError: '#c41d23',
    colorInfo: '#5b6b8c',
    colorText: '#1a1412',
    colorTextSecondary: '#5c534d',
    colorTextTertiary: '#8a817a',
    colorBorder: '#e4ddd6',
    colorBorderSecondary: '#efe8e3',
    colorBgContainer: ADMIN_BG_SURFACE,
    colorBgLayout: ADMIN_BG_CANVAS,
    colorBgElevated: ADMIN_BG_SURFACE,
    colorFillAlter: '#efe8e3',
    colorLink: '#80322E',
    colorLinkHover: '#a0403a',
    colorLinkActive: '#6b2824',
    borderRadius: 8,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    boxShadow:
      '0 1px 2px rgba(22, 18, 16, 0.05), 0 6px 24px rgba(22, 18, 16, 0.06)',
    boxShadowSecondary:
      '0 4px 14px rgba(22, 18, 16, 0.08), 0 12px 40px rgba(22, 18, 16, 0.06)',
    fontFamily:
      "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 16,
    lineHeight: 1.65,
    controlHeight: 40,
    controlOutline: 'rgba(128, 50, 46, 0.12)',
  },
  components: {
    Layout: {
      bodyBg: ADMIN_BG_CANVAS,
      headerBg: ADMIN_BG_SURFACE,
      footerBg: ADMIN_BG_CANVAS,
    },
    Card: {
      borderRadiusLG: 14,
      paddingLG: 24,
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(44, 24, 16, 0.04)',
      dangerShadow: '0 2px 0 rgba(166, 31, 36, 0.06)',
    },
    Input: {
      activeBorderColor: '#80322E',
      hoverBorderColor: '#a0403a',
    },
    Select: {
      optionSelectedBg: 'rgba(128, 50, 46, 0.08)',
    },
    Menu: {
      itemSelectedBg: 'rgba(128, 50, 46, 0.1)',
      itemHoverBg: 'rgba(128, 50, 46, 0.06)',
      horizontalItemSelectedColor: '#80322E',
    },
    Table: {
      headerBg: ADMIN_BG_MUTED,
      headerColor: '#1a1412',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgba(128, 50, 46, 0.045)',
      borderColor: '#e4ddd6',
    },
    Pagination: {
      itemActiveBg: 'rgba(128, 50, 46, 0.08)',
    },
    Modal: {
      borderRadiusLG: 14,
      titleFontSize: 18,
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(44, 24, 16, 0.92)',
    },
    Popover: {
      colorBgElevated: '#ffffff',
    },
    Divider: {
      colorSplit: 'rgba(44, 24, 16, 0.08)',
    },
  },
};

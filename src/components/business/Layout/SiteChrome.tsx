import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Badge,
  Popover,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import type { NavigateFunction } from 'react-router-dom';
import type { RefObject, ReactNode, Ref } from 'react';
import BrandLogo from '@/components/ui/BrandLogo/BrandLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';

const { Header: AntHeader } = AntLayout;

export type SiteChromeProps = {
  chromeShellRef: RefObject<HTMLDivElement | null>;
  isNavVisible: boolean;
  navHeight: number;
  pathname: string;
  navigate: NavigateFunction;
  cartCount: number;
  cartPanel: ReactNode;
  userMenuItems: MenuProps['items'];
  navItems: MenuProps['items'];
};

/**
 * 固定顶栏 + 主导航；类名与 DOM 结构须与 Layout/index.less 中 .top-layout 下选择器一致。
 */
export default function SiteChrome({
  chromeShellRef,
  isNavVisible,
  navHeight,
  pathname,
  navigate,
  cartCount,
  cartPanel,
  userMenuItems,
  navItems,
}: SiteChromeProps) {
  return (
    <div
      ref={chromeShellRef as Ref<HTMLDivElement>}
      className={`site-chrome-shell ${isNavVisible ? '' : 'nav-hidden'}`}
    >
      <div className="top-bar">
        <div className="site-chrome-inner">
          <div className="top-bar-left">
            <SearchOutlined className="top-bar-icon" />
            <span className="phone-number">+86 13910417182</span>
          </div>
          <div className="top-bar-center">
            <button
              type="button"
              className="logo-chip"
              onClick={() => navigate('/')}
              aria-label="林之源 · 返回首页"
            >
              <BrandLogo decorative className="logo" />
            </button>
          </div>
          <div className="top-bar-right">
            <ThemeToggle />
            <Popover
              content={cartPanel}
              title="购物车"
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="top-bar-cart-popover"
            >
              <button
                type="button"
                className="top-bar-icon-btn cart-trigger"
                aria-label="打开购物车预览"
                aria-haspopup="dialog"
              >
                <Badge count={cartCount} size="small" offset={[4, 0]}>
                  <span className="top-bar-badge-anchor">
                    <ShoppingCartOutlined aria-hidden />
                  </span>
                </Badge>
              </button>
            </Popover>
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
              classNames={{ root: 'top-bar-user-dropdown' }}
            >
              <button
                type="button"
                className="top-bar-icon-btn user-menu-trigger"
                aria-label="用户菜单"
                aria-haspopup="menu"
              >
                <UserOutlined aria-hidden />
              </button>
            </Dropdown>
            <Button
              type="primary"
              className="contact-button"
              onClick={() => navigate('/contact')}
            >
              联系我们
            </Button>
          </div>
        </div>
      </div>

      <AntHeader
        className={`nav-bar ${isNavVisible ? '' : 'nav-hidden'}`}
        style={{
          margin: 0,
          padding: 0,
          height: navHeight,
          border: 'none',
        }}
      >
        <div className="site-chrome-inner site-chrome-inner--nav">
          <Menu
            mode="horizontal"
            items={navItems}
            selectedKeys={[pathname]}
            className="nav-menu"
            overflowedIndicator={<MenuOutlined />}
            style={{
              flex: 1,
              minWidth: 0,
            }}
          />
        </div>
      </AntHeader>
    </div>
  );
}

import { Layout as AntLayout, Button, Empty, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Suspense,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { CSSProperties } from 'react';
import { logout } from '@/redux/slices/userSlice';
import ProgressBar from '@/components/ui/ProgressBar';
import SiteFooter from '@/components/business/SiteFooter/SiteFooter';
import SiteChrome from './SiteChrome';
import './index.less';

/** 纵向位移超过该值才切换顶栏/导航显隐，抑制触控板微抖动 */
const SCROLL_DIR_THRESHOLD_PX = 10;

/** 首页顶栏「叠视频」混合：scrollY ≤ START 为 1，≥ END 为 0，之间线性 */
const CHROME_BLEND_SCROLL_START = 72;
const CHROME_BLEND_SCROLL_END = 280;
/** rAF 每帧向目标靠拢比例，越小越柔 */
const CHROME_BLEND_LERP = 0.09;
/** 壳层「通透」略慢于 blend，滑回顶部时避免与 !important 二元切换同阶跃 */
const CHROME_SHELL_CLEAR_LERP = 0.06;
/** smoothstep 区间：与 --chrome-media-blend 同步抬头，无单独阈值跳变 */
const CHROME_SHELL_CLEAR_EDGE0 = 0.42;
const CHROME_SHELL_CLEAR_EDGE1 = 0.88;
/** data-home-atop-hero：滞回加宽，避免壳层着色/阴影在 blend 末段反复切换导致闪动 */
const CHROME_ATOP_HERO_ATTR_ON = 0.95;
const CHROME_ATOP_HERO_ATTR_OFF = 0.62;

function smoothstepChromeClear(s: number): number {
  const d = CHROME_SHELL_CLEAR_EDGE1 - CHROME_SHELL_CLEAR_EDGE0;
  if (d <= 0) return s >= CHROME_SHELL_CLEAR_EDGE1 ? 1 : 0;
  return Math.max(0, Math.min(1, (s - CHROME_SHELL_CLEAR_EDGE0) / d));
}

function computeChromeTargetBlend(scrollY: number): number {
  if (scrollY <= CHROME_BLEND_SCROLL_START) return 1;
  if (scrollY >= CHROME_BLEND_SCROLL_END) return 0;
  return (
    (CHROME_BLEND_SCROLL_END - scrollY) /
    (CHROME_BLEND_SCROLL_END - CHROME_BLEND_SCROLL_START)
  );
}

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [topBarHeight, setTopBarHeight] = useState(52); // 顶部栏高度，移动端 44px
  const [navHeight, setNavHeight] = useState(64); // 导航栏高度，移动端48px
  const lastScrollYRef = useRef(0); // 使用ref替代state，避免不必要的重新渲染
  /** 合并到单帧，避免一次滚动排队多个 RAF 导致顺序错乱、导航条抖动 */
  const navRafRef = useRef<number | null>(null);
  const topLayoutRef = useRef<HTMLDivElement | null>(null);
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const chromeTargetRef = useRef(0);
  const chromeSmoothedRef = useRef(0);
  const chromeShellClearSmoothedRef = useRef(0);
  const chromeBlendLoopRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);
  const chromeShellRef = useRef<HTMLDivElement | null>(null);
  const chromeMotionSkipMountRef = useRef(true);
  const chromeAtopHeroAttrRef = useRef(false);
  // 监听窗口大小变化，动态调整顶部栏和导航栏高度
  useEffect(() => {
    const updateHeights = () => {
      const isMobile = window.innerWidth <= 768;
      setTopBarHeight(isMobile ? 44 : 52);
      setNavHeight(isMobile ? 48 : 64);
    };

    // 初始调用一次
    updateHeights();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeights);

    // 清理函数
    return () => {
      window.removeEventListener('resize', updateHeights);
    };
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      reduceMotionRef.current = false;
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reduceMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const applyChromeBlendToDom = useCallback(
    (blendValue: number, shellClearSmoothed: number) => {
      const el = topLayoutRef.current;
      if (!el) return;
      el.style.setProperty('--chrome-media-blend', blendValue.toFixed(4));
      el.style.setProperty(
        '--chrome-shell-clear',
        shellClearSmoothed.toFixed(4)
      );
      const onHome = pathnameRef.current === '/';
      if (!onHome) {
        chromeAtopHeroAttrRef.current = false;
        el.removeAttribute('data-home-atop-hero');
      } else {
        let on = chromeAtopHeroAttrRef.current;
        if (!on && shellClearSmoothed >= CHROME_ATOP_HERO_ATTR_ON) {
          on = true;
        } else if (on && shellClearSmoothed < CHROME_ATOP_HERO_ATTR_OFF) {
          on = false;
        }
        chromeAtopHeroAttrRef.current = on;
        if (on) {
          el.setAttribute('data-home-atop-hero', '');
        } else {
          el.removeAttribute('data-home-atop-hero');
        }
      }
    },
    []
  );

  const tickChromeBlend = useCallback(() => {
    chromeBlendLoopRef.current = null;
    if (pathnameRef.current !== '/') {
      chromeSmoothedRef.current = 0;
      chromeTargetRef.current = 0;
      chromeShellClearSmoothedRef.current = 0;
      applyChromeBlendToDom(0, 0);
      return;
    }

    const target = chromeTargetRef.current;
    let s = chromeSmoothedRef.current;
    if (reduceMotionRef.current) {
      s = target;
    } else {
      s += (target - s) * CHROME_BLEND_LERP;
    }
    chromeSmoothedRef.current = s;

    const shellClearTarget = smoothstepChromeClear(s);
    let c = chromeShellClearSmoothedRef.current;
    if (reduceMotionRef.current) {
      c = shellClearTarget;
    } else {
      c += (shellClearTarget - c) * CHROME_SHELL_CLEAR_LERP;
    }
    chromeShellClearSmoothedRef.current = c;
    applyChromeBlendToDom(s, c);

    const blendConverged =
      reduceMotionRef.current || Math.abs(target - s) < 0.004;
    const clearConverged =
      reduceMotionRef.current || Math.abs(shellClearTarget - c) < 0.004;
    if (!blendConverged || !clearConverged) {
      chromeBlendLoopRef.current = requestAnimationFrame(tickChromeBlend);
    }
  }, [applyChromeBlendToDom]);

  const ensureChromeBlendLoop = useCallback(() => {
    if (chromeBlendLoopRef.current != null) return;
    chromeBlendLoopRef.current = requestAnimationFrame(tickChromeBlend);
  }, [tickChromeBlend]);

  useLayoutEffect(() => {
    if (location.pathname !== '/') {
      if (chromeBlendLoopRef.current != null) {
        cancelAnimationFrame(chromeBlendLoopRef.current);
        chromeBlendLoopRef.current = null;
      }
      chromeSmoothedRef.current = 0;
      chromeTargetRef.current = 0;
      chromeShellClearSmoothedRef.current = 0;
      applyChromeBlendToDom(0, 0);
      return;
    }

    const t = computeChromeTargetBlend(window.scrollY);
    chromeTargetRef.current = t;
    chromeSmoothedRef.current = t;
    const clearSnap = smoothstepChromeClear(t);
    chromeShellClearSmoothedRef.current = clearSnap;
    const sync = () => applyChromeBlendToDom(t, clearSnap);
    sync();
    if (!topLayoutRef.current) {
      requestAnimationFrame(sync);
    }
  }, [location.pathname, applyChromeBlendToDom]);

  useEffect(() => {
    return () => {
      if (chromeBlendLoopRef.current != null) {
        cancelAnimationFrame(chromeBlendLoopRef.current);
      }
    };
  }, []);

  const updateNavVisibility = useCallback(() => {
    const y = window.scrollY;
    const prev = lastScrollYRef.current;
    const d = y - prev;

    if (y <= 1) {
      setIsNavVisible((p) => (p ? p : true));
      lastScrollYRef.current = y;
      return;
    }

    if (d >= SCROLL_DIR_THRESHOLD_PX) {
      setIsNavVisible((p) => (p === false ? p : false));
      lastScrollYRef.current = y;
      return;
    }

    if (d <= -SCROLL_DIR_THRESHOLD_PX) {
      setIsNavVisible((p) => (p === true ? p : true));
      lastScrollYRef.current = y;
      return;
    }

    // 微小抖动：不更新 lastScrollYRef，避免在临界区来回改「上一帧」导致误判
  }, []);

  const handleScroll = useCallback(() => {
    if (navRafRef.current != null) return;
    navRafRef.current = requestAnimationFrame(() => {
      navRafRef.current = null;
      updateNavVisibility();
      if (location.pathname === '/') {
        chromeTargetRef.current = computeChromeTargetBlend(window.scrollY);
        ensureChromeBlendLoop();
      }
    });
  }, [updateNavVisibility, location.pathname, ensureChromeBlendLoop]);

  useEffect(() => {
    let lastCall = 0;
    const waitMs = 16;
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastCall < waitMs) return;
      lastCall = now;
      handleScroll();
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    lastScrollYRef.current = window.scrollY;

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  /**
   * 在绘制前写入 data-chrome-motion，保证首帧即带上正确 transition（useEffect 晚一拍易导致「瞬切」）。
   * 时长与 index.less 中 show/hide 一致；首 mount 跳过，避免进页播动画。
   */
  useLayoutEffect(() => {
    if (chromeMotionSkipMountRef.current) {
      chromeMotionSkipMountRef.current = false;
      return;
    }
    const el = chromeShellRef.current;
    if (!el) return;

    if (reduceMotionRef.current) {
      el.removeAttribute('data-chrome-motion');
      return;
    }

    el.setAttribute('data-chrome-motion', isNavVisible ? 'show' : 'hide');
    const maxDurSec = isNavVisible ? 0.52 : 0.4;
    const id = window.setTimeout(
      () => {
        el.removeAttribute('data-chrome-motion');
      },
      Math.ceil(maxDurSec * 1000) + 120
    );

    return () => window.clearTimeout(id);
  }, [isNavVisible]);

  const handleLogout = () => {
    dispatch(logout());
    message.success('已退出登录');
    navigate('/login');
  };

  /** 商店 / 活动 / 课程 / 价格 / 公司子站：启用 DeFi 风营销走廊画布与导航样式 */
  const marketingDefiCorridor = useMemo(() => {
    const p = location.pathname;
    return (
      p === '/shop' ||
      p === '/activities' ||
      p === '/courses' ||
      p === '/prices' ||
      p.startsWith('/company/')
    );
  }, [location.pathname]);

  // 导航菜单
  const navItems = [
    {
      key: '/',
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/shop',
      label: '商店',
      onClick: () => navigate('/shop'),
    },
    {
      key: '/activities',
      label: '活动',
      onClick: () => navigate('/activities'),
    },
    {
      key: '/courses',
      label: '课程',
      onClick: () => navigate('/courses'),
    },
    {
      key: '/prices',
      label: '价格',
      onClick: () => navigate('/prices'),
    },
    {
      key: '/company',
      label: '公司',
      children: [
        {
          key: '/company/news',
          label: '新闻',
          onClick: () => navigate('/company/news'),
        },
        {
          key: '/company/case',
          label: '成功案例',
          onClick: () => navigate('/company/case'),
        },
        {
          key: '/company/about',
          label: '关于我们',
          onClick: () => navigate('/company/about'),
        },
      ],
    },
    {
      key: '/help',
      label: '帮助',
      onClick: () => navigate('/help'),
    },
    {
      key: '/contact',
      label: '联系我们',
      onClick: () => navigate('/contact'),
    },
  ];

  // 购物车数量：后续可接入全局状态 / 接口；默认 0 表示空车
  const [cartCount] = useState(0);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'application',
      icon: <AppstoreOutlined />,
      label: '应用程序',
      onClick: () => navigate('/applications'),
    },
    {
      key: 'account',
      icon: <IdcardOutlined />,
      label: '我的账户',
      onClick: () => navigate('/account'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  /** 与固定顶栏占位一致，不随显隐变高：避免收起/展开时正文被 spacer 过渡上下推挤（亦消除与 rect 的反馈闪动） */
  const chromeStackPx = useMemo(
    () => topBarHeight + navHeight,
    [topBarHeight, navHeight]
  );

  const cartPanel = (
    <div className="top-bar-cart-panel">
      {cartCount === 0 ? (
        <>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="购物车还是空的"
            className="top-bar-cart-empty"
          />
          <Button
            type="primary"
            block
            className="top-bar-cart-cta"
            onClick={() => navigate('/shop')}
          >
            去商店选购
          </Button>
        </>
      ) : (
        <>
          <p className="top-bar-cart-summary">共 {cartCount} 件商品</p>
          <Button type="primary" block onClick={() => navigate('/shop')}>
            去结算
          </Button>
        </>
      )}
    </div>
  );

  return (
    <AntLayout
      ref={topLayoutRef}
      className={
        marketingDefiCorridor
          ? 'top-layout top-layout--marketing-defi'
          : 'top-layout'
      }
      style={
        {
          '--ly-chrome-stack-h': `${chromeStackPx}px`,
        } as CSSProperties
      }
    >
      {/* 页面游览进度条，根据菜单栏显示状态自动控制显示/隐藏 */}
      <ProgressBar isMenuVisible={isNavVisible} />

      <SiteChrome
        chromeShellRef={chromeShellRef}
        isNavVisible={isNavVisible}
        navHeight={navHeight}
        pathname={location.pathname}
        navigate={navigate}
        cartCount={cartCount}
        cartPanel={cartPanel}
        userMenuItems={userMenuItems}
        navItems={navItems}
      />

      {/* 占位：与顶栏显隐同步，收起后高度为 0，避免 Hero 仍按满高负 margin 产生割裂 */}
      <div
        className="site-chrome-spacer"
        style={{ height: `${chromeStackPx}px` }}
        aria-hidden
      />

      <main className="site-main">
        <Suspense
          fallback={
            <div
              className="site-outlet-fallback site-outlet-fallback--silent"
              aria-hidden
            />
          }
        >
          <Outlet />
        </Suspense>
        <SiteFooter />
      </main>
    </AntLayout>
  );
};

export default Layout;

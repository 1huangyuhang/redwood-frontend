import type { ComponentType } from 'react';
import {
  HomeOutlined,
  ProductOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
  ReadOutlined,
  TagOutlined,
  MailOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

/** 单条可导航路由（扩展菜单时在此追加即可） */
export type AdminRouteDef = {
  path: string;
  /** Menu item key，与 path 一致便于选中 */
  menuKey: string;
  label: string;
  Icon: ComponentType;
};

export type AdminNavGroup = {
  key: string;
  label: string;
  routes: AdminRouteDef[];
};

/**
 * 侧边栏分组：与顶尖 B 端后台一致，按业务域拆分，便于后续加「订单 / 权限」等模块。
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: 'overview',
    label: '总览',
    routes: [{ path: '/', menuKey: '/', label: '工作台', Icon: HomeOutlined }],
  },
  {
    key: 'crm',
    label: '客户服务',
    routes: [
      {
        path: '/contact-messages',
        menuKey: '/contact-messages',
        label: '联系留言',
        Icon: MailOutlined,
      },
      {
        path: '/support-tickets',
        menuKey: '/support-tickets',
        label: '帮助工单',
        Icon: CustomerServiceOutlined,
      },
    ],
  },
  {
    key: 'content',
    label: '内容运营',
    routes: [
      {
        path: '/products',
        menuKey: '/products',
        label: '产品管理',
        Icon: ProductOutlined,
      },
      {
        path: '/activities',
        menuKey: '/activities',
        label: '活动管理',
        Icon: CalendarOutlined,
      },
      {
        path: '/news',
        menuKey: '/news',
        label: '新闻管理',
        Icon: FileTextOutlined,
      },
      {
        path: '/site-assets',
        menuKey: '/site-assets',
        label: '站点素材',
        Icon: PictureOutlined,
      },
      {
        path: '/courses',
        menuKey: '/courses',
        label: '课程管理',
        Icon: ReadOutlined,
      },
      {
        path: '/pricing-plans',
        menuKey: '/pricing-plans',
        label: '价格套餐',
        Icon: TagOutlined,
      },
    ],
  },
];

const flatRoutes: AdminRouteDef[] = ADMIN_NAV_GROUPS.flatMap((g) => g.routes);

export function findRouteByPath(pathname: string): AdminRouteDef | undefined {
  return flatRoutes.find((r) => r.path === pathname);
}

export function getBreadcrumbTitles(pathname: string): string[] {
  return getBreadcrumbSegments(pathname).map((s) => s.title);
}

/** 面包屑片段；非末级可带 path，用于点击返回分组首页 */
export type BreadcrumbSegment = { title: string; path?: string };

export function getBreadcrumbSegments(pathname: string): BreadcrumbSegment[] {
  if (pathname === '/') {
    return [{ title: '工作台' }];
  }
  for (const g of ADMIN_NAV_GROUPS) {
    const hit = g.routes.find((r) => r.path === pathname);
    if (hit) {
      const landing = g.routes[0]?.path ?? '/';
      return [
        { title: g.label, path: landing === pathname ? undefined : landing },
        { title: hit.label },
      ];
    }
  }
  return [{ title: '页面' }];
}

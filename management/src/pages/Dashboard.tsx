import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Card } from 'antd';
import {
  ShoppingOutlined,
  CalendarOutlined,
  ReadOutlined,
  PictureOutlined,
  BookOutlined,
  TagOutlined,
  MailOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import axiosInstance from '../services/axiosInstance';
import wsService from '../services/websocket';
import type { WebSocketEvent } from '../services/websocket';
import type { StatsSummaryDTO, StatsSummaryResponse } from '@/types/api';

const emptyStats: StatsSummaryDTO = {
  productCount: 0,
  activityCount: 0,
  newsCount: 0,
  siteAssetCount: 0,
  courseCount: 0,
  pricingPlanCount: 0,
  contactMessageCount: 0,
  supportTicketCount: 0,
};

type StatDef = {
  key: keyof StatsSummaryDTO;
  label: string;
  icon: React.ReactNode;
  accent: 'primary' | 'slate' | 'amber' | 'teal';
};

const STAT_DEFS: StatDef[] = [
  {
    key: 'productCount',
    label: '产品',
    icon: <ShoppingOutlined />,
    accent: 'primary',
  },
  {
    key: 'activityCount',
    label: '活动',
    icon: <CalendarOutlined />,
    accent: 'slate',
  },
  {
    key: 'newsCount',
    label: '新闻',
    icon: <ReadOutlined />,
    accent: 'slate',
  },
  {
    key: 'siteAssetCount',
    label: '站点素材',
    icon: <PictureOutlined />,
    accent: 'amber',
  },
  {
    key: 'courseCount',
    label: '课程',
    icon: <BookOutlined />,
    accent: 'teal',
  },
  {
    key: 'pricingPlanCount',
    label: '价格套餐',
    icon: <TagOutlined />,
    accent: 'primary',
  },
  {
    key: 'contactMessageCount',
    label: '联系留言',
    icon: <MailOutlined />,
    accent: 'teal',
  },
  {
    key: 'supportTicketCount',
    label: '帮助工单',
    icon: <CustomerServiceOutlined />,
    accent: 'amber',
  },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsSummaryDTO>(emptyStats);

  const fetchStats = useCallback(async () => {
    try {
      const res = (await axiosInstance.get(
        '/stats/summary'
      )) as StatsSummaryResponse;
      const d = res?.data;
      if (!d) return;
      setStats({
        productCount: d.productCount ?? 0,
        activityCount: d.activityCount ?? 0,
        newsCount: d.newsCount ?? 0,
        siteAssetCount: d.siteAssetCount ?? 0,
        courseCount: d.courseCount ?? 0,
        pricingPlanCount: d.pricingPlanCount ?? 0,
        contactMessageCount: d.contactMessageCount ?? 0,
        supportTicketCount: d.supportTicketCount ?? 0,
      });
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }, []);

  const wsPairs = useMemo(
    () =>
      [
        ['product:created', fetchStats],
        ['product:updated', fetchStats],
        ['product:deleted', fetchStats],
        ['activity:created', fetchStats],
        ['activity:updated', fetchStats],
        ['activity:deleted', fetchStats],
        ['news:created', fetchStats],
        ['news:updated', fetchStats],
        ['news:deleted', fetchStats],
        ['course:created', fetchStats],
        ['course:updated', fetchStats],
        ['course:deleted', fetchStats],
        ['pricingPlan:created', fetchStats],
        ['pricingPlan:updated', fetchStats],
        ['pricingPlan:deleted', fetchStats],
        ['contactMessage:created', fetchStats],
        ['contactMessage:deleted', fetchStats],
        ['supportTicket:created', fetchStats],
        ['supportTicket:updated', fetchStats],
        ['supportTicket:deleted', fetchStats],
      ] as [keyof WebSocketEvent, () => void][],
    [fetchStats]
  );

  useEffect(() => {
    wsPairs.forEach(([ev, fn]) => wsService.on(ev, fn));
    return () => {
      wsPairs.forEach(([ev, fn]) => wsService.off(ev, fn));
    };
  }, [wsPairs]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__hero">
        <h1 className="admin-dashboard__title">工作台</h1>
        <p className="admin-dashboard__subtitle">
          数据总览与快捷感知；指标随列表与 WebSocket 事件自动刷新。
        </p>
      </div>

      <Row gutter={[16, 16]} className="admin-dashboard__stats">
        {STAT_DEFS.map((def) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={def.key}>
            <Card
              bordered={false}
              className={`admin-dashboard__kpi-card admin-dashboard__kpi-card--${def.accent}`}
            >
              <div className="admin-dashboard__kpi-top">
                <span
                  className={`admin-dashboard__kpi-icon admin-dashboard__kpi-icon--${def.accent}`}
                  aria-hidden
                >
                  {def.icon}
                </span>
                <span className="admin-dashboard__kpi-value">
                  {stats[def.key]}
                </span>
              </div>
              <div className="admin-dashboard__kpi-label">{def.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;

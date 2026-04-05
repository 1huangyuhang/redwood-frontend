import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import wsService from '../services/websocket';
import type { StatsSummaryDTO, StatsSummaryResponse } from '@/types/api';
import './index.less';

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

  useEffect(() => {
    const refresh = () => {
      void fetchStats();
    };

    const pairs: [string, () => void][] = [
      ['product:created', refresh],
      ['product:updated', refresh],
      ['product:deleted', refresh],
      ['activity:created', refresh],
      ['activity:updated', refresh],
      ['activity:deleted', refresh],
      ['news:created', refresh],
      ['news:updated', refresh],
      ['news:deleted', refresh],
      ['course:created', refresh],
      ['course:updated', refresh],
      ['course:deleted', refresh],
      ['pricingPlan:created', refresh],
      ['pricingPlan:updated', refresh],
      ['pricingPlan:deleted', refresh],
      ['contactMessage:created', refresh],
      ['contactMessage:deleted', refresh],
      ['supportTicket:created', refresh],
      ['supportTicket:updated', refresh],
      ['supportTicket:deleted', refresh],
    ];

    pairs.forEach(([ev, fn]) => wsService.on(ev, fn));
    return () => {
      pairs.forEach(([ev, fn]) => wsService.off(ev, fn));
    };
  }, [fetchStats]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>欢迎使用企业管理系统</h2>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>产品</h3>
          <p>{stats.productCount}</p>
        </div>
        <div className="stat-card">
          <h3>活动</h3>
          <p>{stats.activityCount}</p>
        </div>
        <div className="stat-card">
          <h3>新闻</h3>
          <p>{stats.newsCount}</p>
        </div>
        <div className="stat-card">
          <h3>站点素材</h3>
          <p>{stats.siteAssetCount}</p>
        </div>
        <div className="stat-card">
          <h3>课程</h3>
          <p>{stats.courseCount}</p>
        </div>
        <div className="stat-card">
          <h3>价格套餐</h3>
          <p>{stats.pricingPlanCount}</p>
        </div>
        <div className="stat-card">
          <h3>联系留言</h3>
          <p>{stats.contactMessageCount}</p>
        </div>
        <div className="stat-card">
          <h3>帮助工单</h3>
          <p>{stats.supportTicketCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

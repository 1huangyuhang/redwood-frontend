import { Typography } from 'antd';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import AboutView from './AboutView';
import './index.less';

const { Title, Text } = Typography;

export default function About() {
  return (
    <MarketingPageShell
      pageClass="about-page"
      defaultHeroClass="page-header"
      title={<Title level={1}>关于我们</Title>}
      lead={<Text>了解公司的发展历程、企业文化和核心优势</Text>}
    >
      <AboutView />
    </MarketingPageShell>
  );
}

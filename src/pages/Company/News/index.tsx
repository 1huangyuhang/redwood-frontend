import { Typography } from 'antd';
import { ScrollAnimatedSection } from '@/animations';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import NewsView from './NewsView';
import './index.less';

const { Title, Text } = Typography;

export default function News() {
  return (
    <MarketingPageShell
      pageClass="news-page"
      defaultHeroClass="page-header"
      title={<Title level={1}>新闻动态</Title>}
      lead={<Text>了解公司最新动态和行业资讯</Text>}
    >
      <ScrollAnimatedSection reveal className="marketing-section-block">
        <NewsView />
      </ScrollAnimatedSection>
    </MarketingPageShell>
  );
}

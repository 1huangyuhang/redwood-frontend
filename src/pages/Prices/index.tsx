import { Typography } from 'antd';
import { ScrollAnimatedSection } from '@/animations';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import PricesView from './PricesView';
import './index.less';

const { Title, Paragraph } = Typography;

export default function Prices() {
  return (
    <MarketingPageShell
      pageClass="prices-page"
      title={<Title level={1}>价格套餐</Title>}
      lead={<Paragraph>选择适合您的红木会员计划，开启红木学习之旅</Paragraph>}
    >
      <ScrollAnimatedSection reveal className="marketing-section-block">
        <PricesView />
      </ScrollAnimatedSection>
    </MarketingPageShell>
  );
}

import { Typography } from 'antd';
import { ScrollAnimatedSection } from '@/animations';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import AccountView from './AccountView';
import './index.less';

const { Title, Text } = Typography;

export default function Account() {
  return (
    <MarketingPageShell
      pageClass="account-page"
      defaultHeroClass="account-page-title"
      title={<Title level={1}>我的账户</Title>}
      lead={<Text type="secondary">管理个人资料、安全选项与通知偏好。</Text>}
    >
      <ScrollAnimatedSection reveal className="marketing-section-block">
        <AccountView />
      </ScrollAnimatedSection>
    </MarketingPageShell>
  );
}

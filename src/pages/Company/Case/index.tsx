import { Typography } from 'antd';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import CaseView from './CaseView';
import './index.less';

const { Title, Text } = Typography;

export default function Case() {
  return (
    <MarketingPageShell
      pageClass="case-page"
      defaultHeroClass="page-header"
      title={<Title level={1}>成功案例</Title>}
      lead={<Text>了解我们的成功项目和客户合作经验</Text>}
    >
      <CaseView />
    </MarketingPageShell>
  );
}

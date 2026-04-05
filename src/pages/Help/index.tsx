import { Typography } from 'antd';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import HelpView from './HelpView';
import './index.less';

const { Title, Text } = Typography;

export default function Help() {
  return (
    <MarketingPageShell
      pageClass="help-page"
      title={<Title level={1}>提交工单</Title>}
      lead={
        <Text type="secondary">
          描述您遇到的问题，我们将在工作日内尽快与您联系。
        </Text>
      }
    >
      <HelpView />
    </MarketingPageShell>
  );
}

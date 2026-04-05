import { Typography } from 'antd';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import ContactView from './ContactView';
import './index.less';

const { Title, Text } = Typography;

export default function Contact() {
  return (
    <MarketingPageShell
      pageClass="contact-page"
      title={<Title level={1}>联系我们</Title>}
      lead={
        <Text>
          如有任何关于我们公司或服务的疑问，欢迎联络我们。我们会尽快回复您。
        </Text>
      }
    >
      <ContactView />
    </MarketingPageShell>
  );
}

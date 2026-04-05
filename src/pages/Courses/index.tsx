import { Typography } from 'antd';
import { ScrollAnimatedSection } from '@/animations';
import { MarketingPageShell } from '@/components/page-shell/MarketingPageShell';
import CoursesView from './CoursesView';
import './index.less';

const { Title, Paragraph } = Typography;

export default function Courses() {
  return (
    <MarketingPageShell
      pageClass="courses-page"
      title={<Title level={1}>红木课程</Title>}
      lead={<Paragraph>学习红木工艺，传承传统文化</Paragraph>}
    >
      <ScrollAnimatedSection reveal className="marketing-section-block">
        <CoursesView />
      </ScrollAnimatedSection>
    </MarketingPageShell>
  );
}

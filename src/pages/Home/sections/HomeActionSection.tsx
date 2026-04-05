import { Typography } from 'antd';
import { SiteButton } from '@/components/ui/SiteButton/SiteButton';
import HoverText from '@/components/ui/HoverText';

const { Title, Paragraph } = Typography;

type Props = { ctaTitle: string; ctaDescription: string };

export default function HomeActionSection({ ctaTitle, ctaDescription }: Props) {
  return (
    <div className="action-section-container">
      <div className="action-content">
        <Title level={3} className="action-title">
          <HoverText text={ctaTitle} />
        </Title>
        <Paragraph className="action-description">{ctaDescription}</Paragraph>
        <SiteButton variant="primary" className="action-button">
          立即咨询
        </SiteButton>
      </div>
    </div>
  );
}

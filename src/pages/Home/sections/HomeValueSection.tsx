import { Typography } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';
import HoverText from '@/components/ui/HoverText';

const { Title, Paragraph } = Typography;

type Props = {
  valueTitle: string;
  valueDescription: string;
  valueImageSrc: string;
};

export default function HomeValueSection({
  valueTitle,
  valueDescription,
  valueImageSrc,
}: Props) {
  return (
    <ScrollAnimatedSection
      className="value-proposition-section"
      animationType="fadeIn"
      duration={1000}
      threshold={0.2}
    >
      <div className="value-content">
        <div className="value-text">
          <Title level={3} className="value-title">
            <HoverText text={valueTitle} />
          </Title>
          <Paragraph className="value-description">
            {valueDescription}
          </Paragraph>
        </div>
        <div className="value-image">
          <AnimatedImage src={valueImageSrc} alt="红木风景" />
        </div>
      </div>
    </ScrollAnimatedSection>
  );
}

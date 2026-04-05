import { Typography } from 'antd';
import { AnimatedImage, ScrollAnimatedSection } from '@/animations';
import HoverText from '@/components/ui/HoverText';

const { Title, Paragraph } = Typography;

type Props = {
  heritageTitle: string;
  heritageDescription: string;
  heritageSrcs: [string, string, string];
};

export default function HomeHeritageSection({
  heritageTitle,
  heritageDescription,
  heritageSrcs,
}: Props) {
  return (
    <ScrollAnimatedSection
      className="heritage-section"
      animationType="fadeIn"
      duration={1000}
      threshold={0.2}
    >
      <div className="heritage-content">
        <div className="heritage-text">
          <Title level={3} className="heritage-title">
            <HoverText text={heritageTitle} />
          </Title>
          <Paragraph className="heritage-description">
            {heritageDescription}
          </Paragraph>
        </div>
        <div className="heritage-images">
          {heritageSrcs.map((src, index) => (
            <div className="heritage-item" key={index}>
              <AnimatedImage src={src} alt="红木细节" />
            </div>
          ))}
        </div>
      </div>
    </ScrollAnimatedSection>
  );
}

import React, { CSSProperties } from 'react';
import '../styles/ScrollAnimatedSection.less';
import { useInViewReveal } from '../hooks/useInViewReveal';

export interface ScrollAnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: CSSProperties;
  id?: string;
  /**
   * 为 true 时使用视口揭示（.reveal-on-scroll + is-revealed），用于营销内容区块。
   * 为 false 时保持与首页区块一致：直接处于 scroll-section--inview 以驱动子元素阶梯动画。
   */
  reveal?: boolean;
}

const ScrollAnimatedSectionComponent: React.FC<ScrollAnimatedSectionProps> = ({
  className = '',
  style = {},
  id,
  reveal = false,
  children,
  ...restProps
}) => {
  const revealRef = useInViewReveal<HTMLDivElement>({
    enabled: reveal,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.15,
  });

  const baseClass = reveal
    ? 'scroll-animated-section reveal-on-scroll'
    : 'scroll-animated-section scroll-section--inview animate-visible';

  const mergedStyle = reveal
    ? style
    : { opacity: 1, transform: 'none', transition: 'none', ...style };

  return (
    <div
      ref={revealRef}
      id={id}
      className={`${baseClass} ${className}`.trim()}
      style={mergedStyle}
      {...restProps}
    >
      {children}
    </div>
  );
};

const ScrollAnimatedSection = React.memo(ScrollAnimatedSectionComponent);
ScrollAnimatedSection.displayName = 'ScrollAnimatedSection';

export default ScrollAnimatedSection;

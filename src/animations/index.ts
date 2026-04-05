// 导出动画组件
export { default as AnimatedImage } from './components/AnimatedImage';
export { default as ScrollAnimatedSection } from './components/ScrollAnimatedSection';
export { default as ScrollyVideo } from './components/ScrollyVideo';

// 导出动画工具函数
export * from './utils/NumberAnimation';
export { useInViewReveal } from './hooks/useInViewReveal';
export { useHomeScrollAnimations } from './hooks/useHomeScrollAnimations';

// 导出动画样式（如果需要直接导入样式）
// import './styles/AnimatedImage.less';
// import './styles/ScrollAnimatedSection.less';
// import './styles/ScrollyVideo.less';
// import './utils/animations.less';

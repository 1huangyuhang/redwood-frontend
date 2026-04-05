import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProgressBar.less';

interface ProgressBarProps {
  // 菜单栏显示状态，true表示显示（展开），false表示隐藏（收回）
  isMenuVisible?: boolean;
}

/**
 * 页面游览进度条组件
 * 显示当前页面的滚动进度，固定在页面顶部
 * 随着用户滚动实时更新，包含平滑的动画效果
 * 根据菜单栏显示状态自动控制显示/隐藏：
 * - 菜单栏展开时（isMenuVisible=true）：隐藏进度条
 * - 菜单栏收回时（isMenuVisible=false）：显示进度条
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ isMenuVisible = true }) => {
  // 滚动进度值，范围0-100
  const [progress, setProgress] = useState(0);
  // 滚动进度状态
  const [scrolled, setScrolled] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastProgressInt = useRef(-1);
  const lastScrolledReported = useRef(0);

  /**
   * 处理滚动事件，计算滚动进度
   */
  const handleScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;
      const denom = Math.max(1, scrollHeight - clientHeight);
      const progressValue = Math.min(
        100,
        Math.max(0, (scrollTop / denom) * 100)
      );
      const pInt = Math.round(progressValue);
      if (pInt !== lastProgressInt.current) {
        lastProgressInt.current = pInt;
        setProgress(progressValue);
      }
      // 用于显隐判断：降低灵敏度，避免在顶部来回闪
      if (Math.abs(scrollTop - lastScrolledReported.current) >= 8) {
        lastScrolledReported.current = scrollTop;
        setScrolled(scrollTop);
      }
    });
  }, []);

  /**
   * 组件挂载时添加滚动事件监听
   * 组件卸载时移除滚动事件监听
   */
  useEffect(() => {
    let lastCall = 0;
    const waitMs = 16;
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastCall < waitMs) return;
      lastCall = now;
      handleScroll();
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  // 决定进度条是否显示：
  // 1. 菜单栏展开时（isMenuVisible=true）：隐藏进度条
  // 2. 菜单栏收回时（isMenuVisible=false）：显示进度条
  // 3. 离开顶部一段距离再显示，避免与导航显隐切换同时抢视觉
  const shouldShowProgressBar = !isMenuVisible && scrolled > 24;

  return (
    <div
      className={`progress-bar-container ${shouldShowProgressBar ? 'visible' : ''}`}
    >
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

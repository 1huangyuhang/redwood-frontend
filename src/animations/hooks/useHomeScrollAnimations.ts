import { useEffect } from 'react';
import {
  animateNumber,
  checkAndAnimate,
  checkVisibility,
} from '../utils/NumberAnimation';

const HOME_NUMBER_SELECTOR = '.home-page .animate-number';

/**
 * 首页统计数字进入视口递增（叠卡动效仍由 CSS + scroll-section--inview 驱动）。
 */
export function useHomeScrollAnimations(stats: unknown, assets: unknown[]) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(checkAndAnimate, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px',
    });

    const numbers = document.querySelectorAll(HOME_NUMBER_SELECTOR);
    numbers.forEach((el) => observer.observe(el));

    const checkImmediately = () => {
      numbers.forEach((element) => {
        if (
          checkVisibility(element) &&
          element.classList.contains('animate-number')
        ) {
          animateNumber(element);
        }
      });
    };

    checkImmediately();

    return () => {
      observer.disconnect();
      const w = window as unknown as {
        scrollTimeout?: ReturnType<typeof setTimeout>;
      };
      if (w.scrollTimeout) {
        clearTimeout(w.scrollTimeout);
      }
    };
  }, [stats, assets]);
}

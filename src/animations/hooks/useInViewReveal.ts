import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export type UseInViewRevealOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** 进入视口后是否停止观察（默认 true） */
  once?: boolean;
  /** 为 false 时不监听，由调用方自行处理展示 */
  enabled?: boolean;
  revealClass?: string;
};

/**
 * 进入视口时为节点添加 `revealClass`（默认 `is-revealed`），配合 `.reveal-on-scroll` 样式。
 */
export function useInViewReveal<T extends HTMLElement>(
  options: UseInViewRevealOptions = {}
): RefObject<T> {
  const {
    root = null,
    rootMargin = '0px 0px -6% 0px',
    threshold = 0.12,
    once = true,
    enabled = true,
    revealClass = 'is-revealed',
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      el.classList.add(revealClass);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(revealClass);
          if (once) observer.unobserve(entry.target);
        }
      },
      { root: root ?? undefined, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, once, root, rootMargin, threshold, revealClass]);

  return ref;
}

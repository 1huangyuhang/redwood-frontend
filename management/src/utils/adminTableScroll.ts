/**
 * 管理端表格横向滚动增强：绑定在 Ant Design Table 的 .ant-table-content 上。
 * - Shift 或 Alt + 滚轮上下 → 横向滚动
 * - 触控板横向滑动（deltaX）→ 横向滚动
 * - 触控：水平方向为主的滑动时平移表格
 * - 边缘渐变提示是否还有更多列
 */

const SCROLL_HOST = '.ant-table-content';
const WRAP_HOST = '.ant-table-wrapper';

const BOUND = '__adminTableScrollBound';

function updateEdgeFade(host: HTMLElement) {
  const wrap = host.closest(WRAP_HOST) as HTMLElement | null;
  if (!wrap) return;

  const max = host.scrollWidth - host.clientWidth;
  if (max < 4) {
    wrap.classList.remove(
      'admin-h-scroll--active',
      'admin-h-scroll--at-start',
      'admin-h-scroll--at-end'
    );
    return;
  }

  wrap.classList.add('admin-h-scroll--active');
  wrap.classList.toggle('admin-h-scroll--at-start', host.scrollLeft <= 3);
  wrap.classList.toggle('admin-h-scroll--at-end', host.scrollLeft >= max - 3);
}

function applyWheelScroll(host: HTMLElement, e: WheelEvent): boolean {
  if (host.scrollWidth <= host.clientWidth + 1) return false;

  let delta = 0;
  if (e.deltaX !== 0) {
    delta = e.deltaX;
  } else if (e.shiftKey || e.altKey) {
    delta = e.deltaY;
  } else {
    return false;
  }

  const nextLeft = host.scrollLeft + delta;
  const max = host.scrollWidth - host.clientWidth;
  const clamped = Math.max(0, Math.min(max, nextLeft));

  if (
    clamped === host.scrollLeft &&
    ((delta < 0 && host.scrollLeft <= 0) ||
      (delta > 0 && host.scrollLeft >= max))
  ) {
    return false;
  }

  e.preventDefault();
  host.scrollLeft = clamped;
  updateEdgeFade(host);

  if (e.deltaX !== 0) {
    e.stopPropagation();
  }

  return true;
}

function bindScrollHost(host: HTMLElement) {
  if ((host as unknown as Record<string, boolean>)[BOUND]) return;
  (host as unknown as Record<string, boolean>)[BOUND] = true;

  host.addEventListener(
    'scroll',
    () => {
      updateEdgeFade(host);
    },
    { passive: true }
  );

  host.addEventListener(
    'wheel',
    (e) => {
      applyWheelScroll(host, e);
    },
    { passive: false }
  );

  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let tracking = false;

  host.addEventListener(
    'touchstart',
    (e) => {
      if (host.scrollWidth <= host.clientWidth + 1) return;
      const t = e.touches[0];
      if (!t) return;
      tracking = true;
      startX = t.clientX;
      startY = t.clientY;
      startLeft = host.scrollLeft;
    },
    { passive: true }
  );

  host.addEventListener(
    'touchmove',
    (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t) return;
      if (host.scrollWidth <= host.clientWidth + 1) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.preventDefault();
        host.scrollLeft = startLeft - dx;
        updateEdgeFade(host);
      }
    },
    { passive: false }
  );

  const endTouch = () => {
    tracking = false;
  };
  host.addEventListener('touchend', endTouch, { passive: true });
  host.addEventListener('touchcancel', endTouch, { passive: true });

  const ro = new ResizeObserver(() => updateEdgeFade(host));
  ro.observe(host);

  updateEdgeFade(host);
}

function scan(root: HTMLElement) {
  root.querySelectorAll(SCROLL_HOST).forEach((el) => {
    bindScrollHost(el as HTMLElement);
    updateEdgeFade(el as HTMLElement);
  });
}

export function initAdminTableScroll(root: HTMLElement) {
  scan(root);

  let t: number | null = null;
  const debouncedScan = () => {
    if (t != null) window.cancelAnimationFrame(t);
    t = window.requestAnimationFrame(() => {
      t = null;
      scan(root);
    });
  };

  const mo = new MutationObserver(debouncedScan);
  mo.observe(root, { childList: true, subtree: true });

  window.addEventListener('resize', debouncedScan);
}

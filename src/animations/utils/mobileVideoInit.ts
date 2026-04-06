/**
 * 移动端视频初始化工具
 * 用于处理移动端视频加载和播放的优化
 */

/**
 * 移动端检测正则表达式
 */
const mobileRegex =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/**
 * 检测是否为移动端设备
 * @returns boolean
 */
export const isMobile = (): boolean => {
  return mobileRegex.test(navigator.userAgent);
};

export type InitMobileVideoOptions = {
  /**
   * 滚动 scrub 场景下切勿用 scroll 触发 play：首次滚动会与 handleScroll 抢控制权，
   * 导致视频按时间轴正常播放而非仅随滚动改 currentTime。
   */
  scrolly?: boolean;
  /** 解锁解码或 load 后回调，用于把 currentTime 重新对齐到滚动进度 */
  onAfterUnlock?: () => void;
};

/**
 * 移动端视频初始化函数
 * @param video HTMLVideoElement - 视频元素
 * @returns () => void - 清理函数
 */
export const initMobileVideo = (
  video: HTMLVideoElement,
  options?: InitMobileVideoOptions
): (() => void) => {
  if (!isMobile()) {
    // 非移动端，直接返回空清理函数
    return () => {};
  }

  const { scrolly = true, onAfterUnlock } = options ?? {};

  const detach = () => {
    document.removeEventListener('touchstart', triggerVideoLoad);
    document.removeEventListener('click', triggerVideoLoad);
    if (!scrolly) {
      document.removeEventListener('scroll', triggerVideoLoad);
    }
  };

  // 定义触发视频加载的函数（仅手势解锁，不保持 play —— 避免与滚动 scrub 冲突）
  const triggerVideoLoad = () => {
    detach();

    void video
      .play()
      .then(() => {
        video.pause();
        onAfterUnlock?.();
      })
      .catch(() => {
        video.load();
        onAfterUnlock?.();
      });
  };

  document.addEventListener('touchstart', triggerVideoLoad, { once: true });
  document.addEventListener('click', triggerVideoLoad, { once: true });
  if (!scrolly) {
    document.addEventListener('scroll', triggerVideoLoad, { once: true });
  }

  return () => {
    detach();
  };
};

export default {
  isMobile,
  initMobileVideo,
};

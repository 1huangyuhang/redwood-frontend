import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';
import '../styles/ScrollyVideo.less';
import { initMobileVideo } from '../utils/mobileVideoInit';

interface ScrollyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  id?: string;
  /** 叠在视频上的 Hero 内容（标题、按钮等），置于渐变遮罩之上 */
  children?: React.ReactNode;
  /** 默认 cover；需整段画面入画无裁切时用 contain（可能出现左右/上下留边） */
  objectFit?: 'cover' | 'contain';
  /**
   * 为 true 时在 loadedmetadata 后按视频原始宽高比设置容器 aspect-ratio（width 100%、height:auto），
   * 并由 intrinsicMaxHeight / intrinsicMinHeight 约束；适合首页主视觉「原比例」展示。
   */
  useVideoAspectLayout?: boolean;
  /** 与 useVideoAspectLayout 配套，默认 min(100dvh, 960px) */
  intrinsicMaxHeight?: string;
  /** 与 useVideoAspectLayout 配套，默认 460px */
  intrinsicMinHeight?: string;
}

/**
 * 滚动控制视频组件，根据页面滚动位置同步视频播放
 */
const ScrollyVideo: React.FC<ScrollyVideoProps> = ({
  src,
  poster,
  className = '',
  height = '100vh',
  width = '100%',
  id,
  children,
  objectFit,
  useVideoAspectLayout = false,
  intrinsicMaxHeight = 'min(100dvh, 960px)',
  intrinsicMinHeight = '460px',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [naturalAspect, setNaturalAspect] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const resolvedObjectFit =
    objectFit ?? (useVideoAspectLayout ? 'contain' : undefined);
  const intrinsicActive = Boolean(
    useVideoAspectLayout &&
    naturalAspect &&
    naturalAspect.w > 0 &&
    naturalAspect.h > 0
  );

  // 提取滚动处理函数到组件作用域
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const lastScrollProgressRef = useRef<number>(-1);
  /** 首屏布局下容器顶相对视口的 top，用于从「当前位置」起算 scrub，避免须滚到 top≤0 才动 */
  const anchorTopRef = useRef<number | null>(null);

  const captureScrollAnchor = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    anchorTopRef.current = el.getBoundingClientRect().top;
  }, []);

  /**
   * 稳定引用：避免 isVideoEnded 等 state 导致 handleScroll 重建 → scroll 监听反复卸载，
   * 并在布局仅变化、未触发 scroll 时仍能复用同一套同步逻辑。
   */
  const handleScroll = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    animationFrameIdRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      const container = containerRef.current;

      if (!video || !container) return;

      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerTop = containerRect.top;

      const anchorTop = anchorTopRef.current;
      let scrollProgress: number;
      if (anchorTop == null) {
        scrollProgress = Math.max(
          0,
          Math.min(1, -containerTop / viewportHeight)
        );
      } else {
        const denom = anchorTop + viewportHeight;
        if (denom <= 0) {
          scrollProgress = Math.max(
            0,
            Math.min(1, -containerTop / viewportHeight)
          );
        } else {
          scrollProgress = Math.max(
            0,
            Math.min(1, (anchorTop - containerTop) / denom)
          );
        }
      }

      const progressMoved =
        Math.abs(scrollProgress - lastScrollProgressRef.current) > 0.001;
      const dur = video.duration;
      const targetTime =
        Number.isFinite(dur) && dur > 0 ? dur * scrollProgress : NaN;

      /*
       * duration 稍晚就绪时，scrollProgress 可能已与上次相同，若整段跳过则永远不会 seek。
       * 因此在时长有效时始终校正 currentTime（与目标差超过一帧再写，减轻解码压力）。
       */
      if (Number.isFinite(targetTime)) {
        if (
          !Number.isFinite(video.currentTime) ||
          Math.abs(video.currentTime - targetTime) > 0.05
        ) {
          video.currentTime = targetTime;
        }
      }

      if (progressMoved) {
        container.style.setProperty(
          '--scrolly-progress',
          scrollProgress.toFixed(4)
        );

        setIsVideoEnded((prev) => {
          if (scrollProgress >= 1.0 && !prev) return true;
          if (scrollProgress < 1.0 && prev) return false;
          return prev;
        });

        lastScrollProgressRef.current = scrollProgress;
      }
    });
  }, []);

  // 挂载、换源、宽高比就绪后：重采锚点并立即对齐 currentTime（仅靠 scroll 事件会漏掉「只改高度不滚动」）
  useLayoutEffect(() => {
    captureScrollAnchor();
    handleScroll();
  }, [src, captureScrollAnchor, naturalAspect, handleScroll]);

  useLayoutEffect(() => {
    if (!useVideoAspectLayout) {
      setNaturalAspect(null);
      return;
    }
    setNaturalAspect(null);
    const video = videoRef.current;
    if (!video) return;

    const applyMeta = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setNaturalAspect({ w: video.videoWidth, h: video.videoHeight });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      applyMeta();
    }
    video.addEventListener('loadedmetadata', applyMeta);
    return () => video.removeEventListener('loadedmetadata', applyMeta);
  }, [src, useVideoAspectLayout]);

  // 容器高度随 intrinsic / 字体等变化时重采锚点，否则 (anchorTop - rect.top) 与真实滚动脱节
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      captureScrollAnchor();
      handleScroll();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [captureScrollAnchor, handleScroll]);

  // 视口变化（地址栏、横竖屏、窗口缩放）须重采锚点；不限于「在页顶」
  useEffect(() => {
    const onResize = () => {
      captureScrollAnchor();
      handleScroll();
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [captureScrollAnchor, handleScroll]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onVv = () => {
      captureScrollAnchor();
      handleScroll();
    };
    vv.addEventListener('resize', onVv);
    vv.addEventListener('scroll', onVv);
    return () => {
      vv.removeEventListener('resize', onVv);
      vv.removeEventListener('scroll', onVv);
    };
  }, [captureScrollAnchor, handleScroll]);

  // 滚动同步逻辑
  useEffect(() => {
    // 监听滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 初始执行一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [handleScroll]);

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      // 视频加载完成后，重新计算滚动进度，确保初始位置正确
      handleScroll();
    };

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      // 视频可以播放时，重新计算滚动进度，确保初始位置正确
      handleScroll();
    };

    const handleEnded = () => {
      // 视频播放结束后，设置为结束状态
      setIsVideoEnded(true);
    };

    const handlePlay = () => {
      setIsVideoEnded(false);
    };

    const handlePause = () => {
      // 视频暂停处理
    };

    const handleTimeUpdate = () => {
      const d = video.duration;
      if (
        video &&
        Number.isFinite(d) &&
        d > 0 &&
        Math.abs(video.currentTime - d) < 0.5
      ) {
        setIsVideoEnded(true);
      }
    };

    const handleError = (e: Event) => {
      setIsVideoLoaded(true);
      if (process.env.NODE_ENV === 'development') {
        console.error('Video error:', e);
        console.error('Video error details:', {
          error: video.error?.code,
          message: video.error?.message,
        });
      }
    };

    // 监听视频缓冲事件
    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = bufferedEnd / video.duration;
        setBufferProgress(progress);
      }
    };

    // 添加事件监听器
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('progress', handleProgress);

    // 使用导入的移动端视频初始化工具
    const cleanupMobileVideo = initMobileVideo(video, {
      scrolly: true,
      onAfterUnlock: () => handleScroll(),
    });

    return () => {
      // 移除事件监听器
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('progress', handleProgress);
      // 调用移动端视频初始化的清理函数
      cleanupMobileVideo();
    };
  }, [src, handleScroll]);

  const containerStyle: React.CSSProperties = {
    width,
    position: 'relative',
    overflow: 'hidden',
    ...(intrinsicActive && naturalAspect
      ? {
          aspectRatio: `${naturalAspect.w} / ${naturalAspect.h}`,
          height: 'auto',
          maxHeight: intrinsicMaxHeight,
          minHeight: intrinsicMinHeight,
        }
      : { height }),
  };

  return (
    <div
      id={id}
      className={`scrolly-video-container ${className} ${isVideoEnded ? 'video-ended' : ''} ${
        intrinsicActive ? 'scrolly-video-container--intrinsic-ar' : ''
      }`}
      ref={containerRef}
      style={containerStyle}
    >
      <video
        ref={videoRef}
        className="scrolly-video-element video-ready"
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        style={{
          opacity: 1,
          ...(resolvedObjectFit ? { objectFit: resolvedObjectFit } : {}),
        }}
      />

      {children ? (
        <div
          className={`scrolly-video-overlay${isVideoLoaded ? ' scrolly-video-overlay--media-ready' : ''}`}
        >
          <div className="scrolly-video-overlay__scrim" aria-hidden="true" />
          <div className="scrolly-video-overlay__inner">{children}</div>
        </div>
      ) : null}

      {/* 缓冲指示器 */}
      {isBuffering && (
        <div className="scrolly-video-buffering">
          <div className="loading-spinner"></div>
          <div className="buffer-progress">
            缓冲中: {Math.round(bufferProgress * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollyVideo;

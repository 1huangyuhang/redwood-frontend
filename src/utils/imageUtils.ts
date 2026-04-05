/**
 * 图片工具函数
 * 功能：
 * 1. 处理图片URL，支持base64和普通URL
 * 2. 提供默认图片（当前为空值，待后续提供）
 * 3. 处理图片加载错误
 * 4. 实现平滑的图片切换效果
 */

// 默认图片URL（当前为空值，待后续提供默认图片资源后再进行更新）
export const DEFAULT_IMAGE = '';

/**
 * 处理图片URL
 * @param imageData 图片数据，可以是base64字符串或普通URL
 * @param defaultImage 默认图片URL
 * @returns 处理后的图片URL
 */
export const processImageUrl = (
  imageData: string | null | undefined,
  defaultImage: string = DEFAULT_IMAGE
): string => {
  if (!imageData || typeof imageData !== 'string' || imageData.trim() === '') {
    return defaultImage;
  }

  const trimmed = imageData.trim();

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `data:image/jpeg;base64,${trimmed}`;
};

/**
 * 图片加载错误处理函数
 * @param e 错误事件
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>
): void => {
  e.currentTarget.src = DEFAULT_IMAGE;
  // 添加图片加载错误的样式类，实现平滑切换效果
  e.currentTarget.classList.add('image-load-error');
};

/**
 * 图片加载成功处理函数
 * @param e 成功事件
 */
export const handleImageLoad = (
  e: React.SyntheticEvent<HTMLImageElement>
): void => {
  // 移除图片加载错误的样式类
  e.currentTarget.classList.remove('image-load-error');
};

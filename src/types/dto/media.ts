import { processImageUrl } from '@/utils/imageUtils';

/**
 * 与后端 `serializeMediaFields` 出参对齐：优先外链 `imageUrl`，否则 `image` 为裸 base64。
 */
export type MediaFieldsDTO = {
  image: string | null;
  imageUrl: string | null;
};

/**
 * 供 `<img src={...}>` 使用：先 imageUrl，再 base64，最后 fallback。
 */
export function mediaDisplaySrc(
  m: Pick<MediaFieldsDTO, 'image' | 'imageUrl'>,
  fallback = ''
): string {
  const url = m.imageUrl?.trim();
  if (url) {
    return processImageUrl(url, fallback);
  }
  const b64 = m.image?.trim();
  if (b64) {
    return processImageUrl(b64, fallback);
  }
  return fallback;
}

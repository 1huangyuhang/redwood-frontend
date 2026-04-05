export const DEFAULT_IMAGE = 'https://picsum.photos/id/1060/800/600';

export function detectMimeFromBase64Payload(base64Payload: string): string {
  const s = base64Payload.replace(/\s/g, '');
  if (!s.length) return 'image/jpeg';
  if (s.startsWith('/9j/')) return 'image/jpeg';
  if (s.startsWith('iVBORw')) return 'image/png';
  if (s.startsWith('R0lGOD')) return 'image/gif';
  if (s.startsWith('UklGR')) return 'image/webp';
  if (s.startsWith('Qk')) return 'image/bmp';
  if (s.startsWith('PHN2Z')) return 'image/svg+xml';
  return 'image/jpeg';
}

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
  const cleanB64 = trimmed.replace(/\s/g, '');
  const mime = detectMimeFromBase64Payload(cleanB64);
  return `data:${mime};base64,${cleanB64}`;
};

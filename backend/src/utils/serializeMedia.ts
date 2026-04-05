/**
 * 双轨媒体：优先外链 imageUrl（生产/CDN），否则回退 BYTEA → Base64。
 * 有 imageUrl 时不返回 base64，减小响应体积。
 */
export type RowWithMedia = {
  image?: Uint8Array | Buffer | null;
  imageUrl?: string | null;
};

export function serializeMediaFields(row: RowWithMedia): {
  image: string | null;
  imageUrl: string | null;
} {
  const imageUrl =
    row.imageUrl && String(row.imageUrl).trim().length > 0
      ? String(row.imageUrl).trim()
      : null;
  if (imageUrl) {
    return { image: null, imageUrl };
  }
  const buf = row.image;
  if (buf) {
    const b = Buffer.from(buf);
    if (b.length > 0) {
      return {
        image: b.toString('base64'),
        imageUrl: null,
      };
    }
  }
  return { image: null, imageUrl: null };
}

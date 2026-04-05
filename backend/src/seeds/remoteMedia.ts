/**
 * 种子数据使用的公开 JPEG 地址（Picsum 固定图片 id，便于长期复现）。
 * 运行 seed 时下载二进制写入 PostgreSQL bytea；接口仍以 base64 返回给前端。
 *
 * 列表文档：https://picsum.photos/
 */
export const REMOTE_JPEG_URLS = [
  'https://picsum.photos/id/1015/1200/800',
  'https://picsum.photos/id/1018/1200/800',
  'https://picsum.photos/id/1019/1200/800',
  'https://picsum.photos/id/1025/1200/800',
  'https://picsum.photos/id/1035/1200/800',
  'https://picsum.photos/id/1036/1200/800',
  'https://picsum.photos/id/1038/1200/800',
  'https://picsum.photos/id/1043/1200/800',
  'https://picsum.photos/id/1044/1200/800',
  'https://picsum.photos/id/1050/1200/800',
] as const;

export async function fetchRemoteJpegBuffers(): Promise<Buffer[]> {
  const out: Buffer[] = [];
  for (const url of REMOTE_JPEG_URLS) {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(
        `Seed image fetch failed: ${url} → ${res.status} ${res.statusText}`
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) {
      throw new Error(`Seed image empty body: ${url}`);
    }
    out.push(buf);
  }
  return out;
}

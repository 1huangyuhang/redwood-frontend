/** API 出参：优先 imageUrl；无外链时 image 为 base64 */
export type SerializedSiteAsset = {
  id: number;
  page: string;
  groupKey: string;
  sortOrder: number;
  title: string | null;
  alt: string | null;
  content: string | null;
  meta: string | null;
  image: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

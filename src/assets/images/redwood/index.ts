/**
 * 首页/关于页兜底图：固定 Picsum 图片 id，与 backend/src/seeds/remoteMedia 同源，便于长期复现。
 * 本地红木实拍 JPG 若恢复，可改回 `import x from './xxx.jpg'` 再导出。
 */
const pic = (id: number) => `https://picsum.photos/id/${id}/1200/800`;

/** 命名导出，供 Home 等解构使用 */
export const redwoodImages = {
  redwood1: pic(1015),
  redwoodDetail1: pic(1018),
  redwoodDetail2: pic(1019),
  redwoodDetail3: pic(1025),
  redwoodDetail4: pic(1035),
  redwoodDetail5: pic(1036),
  redwoodScenery: pic(1038),
  redwoodFactory: pic(1043),
  redwoodRaw1: pic(1044),
  redwoodRaw2: pic(1050),
  redwoodRaw3: pic(1015),
  redwoodRaw4: pic(1018),
} as const;

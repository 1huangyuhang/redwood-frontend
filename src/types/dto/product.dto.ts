import type { MediaFieldsDTO } from './media';
import {
  coerceBoolean,
  coerceNumber,
  coerceString,
  coerceIsoDateString,
  coerceNullableString,
} from './utils';

/** 官网 / 接口 `GET /api/products` 列表项（与 `formatProduct` 一致） */
export type ProductDTO = MediaFieldsDTO & {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  category: string;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
};

export function parseProductDto(raw: unknown): ProductDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  const price = coerceNumber(o.price);
  const categoryId = coerceNumber(o.categoryId);
  if (id == null || price == null || categoryId == null) return null;

  const createdAt = coerceIsoDateString(o.createdAt) ?? '';
  const updatedAt = coerceIsoDateString(o.updatedAt) ?? '';

  return {
    id,
    name: coerceString(o.name),
    price,
    categoryId,
    category: coerceString(o.category),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    isNew: coerceBoolean(o.isNew),
    createdAt,
    updatedAt,
  };
}

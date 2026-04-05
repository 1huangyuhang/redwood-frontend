import type { MediaFieldsDTO } from './media';
import {
  coerceNumber,
  coerceString,
  coerceIsoDateString,
  coerceNullableString,
} from './utils';

/** 官网课程列表（与 `formatCourse` 一致）；tags 已由后端解析为 string[] */
export type CourseDTO = MediaFieldsDTO & {
  id: number;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  description: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function parseCourseDto(raw: unknown): CourseDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  const price = coerceNumber(o.price);
  const students = coerceNumber(o.students);
  const rating = coerceNumber(o.rating);
  const sortOrder = coerceNumber(o.sortOrder);
  if (
    id == null ||
    price == null ||
    students == null ||
    rating == null ||
    sortOrder == null
  ) {
    return null;
  }

  const tagsRaw = o.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t): t is string => typeof t === 'string')
    : [];

  return {
    id,
    title: coerceString(o.title),
    instructor: coerceString(o.instructor),
    category: coerceString(o.category),
    duration: coerceString(o.duration),
    students,
    rating,
    price,
    description: coerceString(o.description),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    tags,
    sortOrder,
    createdAt: coerceIsoDateString(o.createdAt) ?? '',
    updatedAt: coerceIsoDateString(o.updatedAt) ?? '',
  };
}

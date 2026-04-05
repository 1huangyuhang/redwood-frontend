import axiosInstance from '@/services/axiosInstance';
import { parsePaginatedList } from '@/types/api';
import type {
  ActivityListParams,
  NewsListParams,
  ProductListParams,
} from '@/queryKeys';

export interface ActivityRow {
  id: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: number;
  name: string;
  price: string | number;
  categoryId: number;
  category: string;
  image: string;
  imageUrl: string;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRow {
  id: number;
  title: string;
  content: string;
  summary: string;
  date: string;
  time: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

function mapActivity(item: Record<string, unknown>): ActivityRow {
  return {
    id: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10),
    title:
      typeof item.title === 'string' ? item.title : String(item.title ?? ''),
    description:
      typeof item.description === 'string'
        ? item.description
        : String(item.description ?? ''),
    image: typeof item.image === 'string' ? item.image : '',
    createdAt:
      typeof item.createdAt === 'string'
        ? item.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === 'string'
        ? item.updatedAt
        : new Date().toISOString(),
  };
}

function mapProduct(item: Record<string, unknown>): ProductRow {
  const idRaw = item.id;
  return {
    id: typeof idRaw === 'number' ? idRaw : parseInt(String(idRaw), 10),
    name: typeof item.name === 'string' ? item.name : String(item.name ?? ''),
    price:
      typeof item.price === 'number'
        ? item.price
        : typeof item.price === 'string'
          ? parseFloat(item.price) || 0
          : 0,
    categoryId:
      typeof item.categoryId === 'number'
        ? item.categoryId
        : parseInt(String(item.categoryId ?? '0'), 10) || 0,
    category:
      typeof item.category === 'string'
        ? item.category
        : String(item.category ?? ''),
    image: typeof item.image === 'string' ? item.image : '',
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    isNew: Boolean(item.isNew),
    createdAt:
      typeof item.createdAt === 'string'
        ? item.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === 'string'
        ? item.updatedAt
        : new Date().toISOString(),
  };
}

function mapNews(item: Record<string, unknown>): NewsRow {
  return {
    id: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10),
    title:
      typeof item.title === 'string' ? item.title : String(item.title ?? ''),
    content:
      typeof item.content === 'string'
        ? item.content
        : String(item.content ?? ''),
    summary:
      typeof item.summary === 'string'
        ? item.summary
        : String(item.summary ?? ''),
    date: typeof item.date === 'string' ? item.date : '',
    time: typeof item.time === 'string' ? item.time : '',
    image: typeof item.image === 'string' ? item.image : '',
    createdAt:
      typeof item.createdAt === 'string'
        ? item.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof item.updatedAt === 'string'
        ? item.updatedAt
        : new Date().toISOString(),
  };
}

export async function fetchActivitiesPage(params: ActivityListParams): Promise<{
  list: ActivityRow[];
  total: number;
}> {
  const res = await axiosInstance.get('/activities', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      ...(params.search.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const { list, total } = parsePaginatedList<Record<string, unknown>>(res);
  return { list: list.map(mapActivity), total };
}

export async function fetchProductsPage(params: ProductListParams): Promise<{
  list: ProductRow[];
  total: number;
}> {
  const res = await axiosInstance.get('/products', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      ...(params.search.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const { list, total } = parsePaginatedList<Record<string, unknown>>(res);
  return { list: list.map(mapProduct), total };
}

export async function fetchNewsPage(params: NewsListParams): Promise<{
  list: NewsRow[];
  total: number;
}> {
  const res = await axiosInstance.get('/news', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      ...(params.search.trim() ? { search: params.search.trim() } : {}),
    },
  });
  const { list, total } = parsePaginatedList<Record<string, unknown>>(res);
  return { list: list.map(mapNews), total };
}

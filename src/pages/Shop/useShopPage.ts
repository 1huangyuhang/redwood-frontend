import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import { fetchAllPaginatedList } from '@/utils/apiListResponse';
import { type ProductDTO, parseProductDto } from '@/types/dto';

export type ShopProduct = ProductDTO & { isFavorite: boolean };

export function useShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/products'
      );
      const formattedProducts: ShopProduct[] = rows
        .map(parseProductDto)
        .filter((p): p is ProductDTO => p != null)
        .map((p) => ({ ...p, isFavorite: false }));
      setProducts(formattedProducts);
    } catch (err) {
      setError('获取产品数据失败，请稍后重试');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return { products, loading, error, loadProducts };
}

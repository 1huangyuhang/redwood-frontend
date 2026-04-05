import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import { fetchAllPaginatedList } from '@/utils/apiListResponse';
import { type NewsListItemDTO, parseNewsListItemDto } from '@/types/dto';

export function useNewsPage() {
  const [newsData, setNewsData] = useState<NewsListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/news'
      );
      const formattedNews = rows
        .map(parseNewsListItemDto)
        .filter((n): n is NewsListItemDTO => n != null);
      setNewsData(formattedNews);
    } catch (err) {
      setError('获取新闻数据失败，请稍后重试');
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews();
  }, [loadNews]);

  const start = (currentPage - 1) * pageSize;
  const pageItems = newsData.slice(start, start + pageSize);

  return {
    newsData,
    loading,
    error,
    loadNews,
    currentPage,
    pageSize,
    pageItems,
    handlePageChange,
    handlePageSizeChange,
  };
}

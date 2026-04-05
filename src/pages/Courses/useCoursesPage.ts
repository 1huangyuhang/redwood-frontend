import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import { fetchAllPaginatedList } from '@/utils/apiListResponse';
import { type CourseDTO, parseCourseDto } from '@/types/dto';

export function useCoursesPage() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/courses'
      );
      const list = rows
        .map(parseCourseDto)
        .filter((c): c is CourseDTO => c != null);
      setCourses(list);
    } catch (e) {
      setError('获取课程数据失败，请稍后重试');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  return { courses, loading, error, loadCourses };
}

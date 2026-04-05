import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import { fetchAllPaginatedList } from '@/utils/apiListResponse';
import { type ActivityDTO, parseActivityDto } from '@/types/dto';

export function useActivitiesPage() {
  const [activities, setActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDTO | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedActivity(null);
  };

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchAllPaginatedList<Record<string, unknown>>(
        axiosInstance,
        '/activities'
      );
      const formattedActivities = rows
        .map(parseActivityDto)
        .filter((a): a is ActivityDTO => a != null);
      setActivities(formattedActivities);
    } catch (err) {
      setError('获取活动数据失败，请稍后重试');
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const handleActivityClick = useCallback((activity: ActivityDTO) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  }, []);

  return {
    activities,
    loading,
    error,
    loadActivities,
    selectedActivity,
    isModalVisible,
    handleModalClose,
    handleActivityClick,
  };
}

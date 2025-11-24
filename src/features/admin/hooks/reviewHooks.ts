// src/features/admin/hooks/reviewHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

// Get all reviews with filters
export const useAdminReviews = (filters: any = {}) => {
  return useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = params.toString() ? `/admin/reviews?${params}` : '/admin/reviews';
      const response = await apiClient.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Get review statistics
export const useReviewStats = () => {
  return useQuery({
    queryKey: ['admin-review-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/reviews/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Delete review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/reviews/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] });
    },
  });
};

// Bulk delete reviews
export const useBulkDeleteReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.post('/admin/reviews/bulk', {
        action: 'delete',
        reviewIds: ids,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] });
    },
  });
};

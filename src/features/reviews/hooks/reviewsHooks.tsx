// src/features/reviews/hooks/reviewsHooks.tsx - ВИПРАВЛЕНО

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews-api';
import { useAuthStore } from '@/shared/stores/auth';
import { showNotification } from '@/shared/utils/notifications';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface ProductReviewsParams {
  productId: string;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  limit?: number;
  offset?: number;
}

// Check if user can review product - ВИПРАВЛЕНО
export const useCanReview = (productId: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['reviews', 'canReview', productId],
    queryFn: () => reviewsApi.canUserReview(productId),
    enabled: !!productId && isAuthenticated === true, // Explicit boolean check
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });
};

// Get reviews for product
export const useProductReviews = (params: ProductReviewsParams) => {
  return useQuery({
    queryKey: ['reviews', 'product', params.productId, params.sortBy, params.limit, params.offset],
    queryFn: () => reviewsApi.getProductReviews(params),
    enabled: !!params.productId,
    retry: 2,
  });
};

// Create review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.createReview(data),
    onSuccess: (_, variables) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'product', variables.productId],
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({
        queryKey: ['profile', 'orders'],
      });
      // Invalidate canReview check
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'canReview', variables.productId],
      });
      showNotification({
        title: 'Успіх',
        message: 'Відгук успішно створено',
      });
    },
    retry: false, // Don't retry on permission errors
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate all reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });

      showNotification({
        title: 'Успіх',
        message: 'Відгук видалено',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      showNotification({
        title: 'Помилка',
        message: error.message,
        color: 'red',
      });
    },

    retry: false,
  });
};

// Mark review as helpful
export const useMarkHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.markHelpful(reviewId),
    onSuccess: () => {
      // Invalidate all reviews queries
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });
    },
    retry: 1,
  });
};

// Get user's reviews
export const useMyReviews = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['reviews', 'my', params?.limit, params?.offset],
    queryFn: () => reviewsApi.getMyReviews(params),
    retry: 2,
  });
};

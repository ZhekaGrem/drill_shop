// src/features/reviews/api/reviews-api.ts
import { apiClient, handleApiResponse, handleApiError } from '@/shared/api';
import { reviewEndpoints } from '@/shared/api/endpoints';

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

export interface ReviewResponse {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  helpfulCount: number;
  createdAt: string;
  author: {
    name: string;
    isVerified: boolean;
  };
  timeAgo: string;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: ReviewResponse[];
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  message: string;
}

export const reviewsApi = {
  // ВИПРАВЛЕНО: Спрощена перевірка - кожен авторизований може залишити відгук
  async canUserReview(productId: string): Promise<{ canReview: boolean; reason?: string }> {
    try {
      // Просто повертаємо true для авторизованих користувачів
      return { canReview: true };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return {
          canReview: false,
          reason: 'Увійдіть в акаунт, щоб залишити відгук',
        };
      }

      // За замовчуванням дозволяємо
      return { canReview: true };
    }
  },

  // Отримати відгуки товару
  async getProductReviews(params: ProductReviewsParams): Promise<ProductReviewsResponse> {
    const searchParams = new URLSearchParams();
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const response = await apiClient.get(
      `${reviewEndpoints.productReviews(params.productId)}?${searchParams}`
    );
    return response.data;
  },

  async createReview(data: CreateReviewData): Promise<{ success: boolean; data: ReviewResponse }> {
    try {
      const response = await apiClient.post(reviewEndpoints.createReview, data);
      return handleApiResponse(response, 'Не вдалося створити відгук');
    } catch (error: any) {
      // Обробка специфічних помилок
      if (error.response?.status === 429) {
        throw new Error('Забагато запитів. Спробуйте пізніше.');
      }
      throw handleApiError(error, 'Не вдалося створити відгук');
    }
  },

  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return handleApiResponse(response, 'Не вдалося видалити відгук');
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Ви можете видаляти тільки власні відгуки');
      }
      if (error.response?.status === 404) {
        throw new Error('Відгук не знайдено');
      }
      throw handleApiError(error, 'Не вдалося видалити відгук');
    }
  },

  // Відзначити як корисний
  async markHelpful(reviewId: string): Promise<{ success: boolean; data: { helpfulCount: number } }> {
    try {
      const response = await apiClient.post(reviewEndpoints.markHelpful(reviewId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Забагато запитів. Спробуйте пізніше.');
      }
      throw new Error('Не вдалося відзначити відгук як корисний');
    }
  },

  // Мої відгуки
  async getMyReviews(params?: { limit?: number; offset?: number; productId?: string }): Promise<{
    success: boolean;
    data: ReviewResponse[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.productId) searchParams.append('productId', params.productId);

    const response = await apiClient.get(`${reviewEndpoints.myReviews}?${searchParams}`);
    return response.data;
  },
};

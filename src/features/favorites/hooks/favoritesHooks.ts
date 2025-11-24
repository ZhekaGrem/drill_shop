// src/features/favorites/model/favoritesHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { userEndpoints } from '@/shared/api/endpoints';
import { Product } from '@/shared/types';

interface FavoriteItem {
  addedAt: string;
  product: Product;
}

interface FavoritesResponse {
  data: FavoriteItem[];
  total: number;
}

export const useFavorites = () => {
  return useQuery<FavoritesResponse>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await apiClient.get(userEndpoints.favorites);
      return response.data;
    },
    enabled: !!apiClient.defaults.headers.common['Authorization'],
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      return apiClient.post(userEndpoints.toggleFavorite, { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['isFavorite'] });
    },
  });
};

export const useIsFavorite = (productId: string) => {
  return useQuery<boolean>({
    queryKey: ['isFavorite', productId],
    queryFn: async () => {
      const response = await apiClient.get(userEndpoints.checkFavorite(productId));
      return response.data.isFavorite;
    },
    enabled: !!productId && !!apiClient.defaults.headers.common['Authorization'],
  });
};

// src/features/admin/hooks/discountHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { DiscountType } from '@/shared/types/index';

// Get all discounts with filters
export const useAdminDiscounts = (filters: any = {}) => {
  return useQuery({
    queryKey: ['admin-discounts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = params.toString() ? `/discounts/admin?${params}` : '/discounts/admin';
      const response = await apiClient.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Create discount
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/discounts/admin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
  });
};

// Update discount
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/discounts/admin/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
  });
};

// Delete discount
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/discounts/admin/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    },
  });
};

// Get discount usage stats
export const useDiscountStats = (id: string) => {
  return useQuery({
    queryKey: ['discount-stats', id],
    queryFn: async () => {
      const response = await apiClient.get(`/discounts/admin/${id}/stats`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Validate promo code
export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async (data: { code: string; orderAmount?: number }) => {
      const response = await apiClient.post('/discounts/validate', data);
      return response.data;
    },
  });
};

// src/features/admin/hooks/useModifyOrder.ts - FIXED TO USE APICLIENT
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client'; // FIXED: Use apiClient instead of fetch
import { Order } from '@/shared/types/generated.types';

interface ModifyOrderData {
  guestEmail?: string;
  guestPhone?: string;
  guestFirstName?: string;
  guestLastName?: string;
  shippingAddress?: {
    fullName: string;
    street?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  addItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  removeItemIds?: string[];
  updateItems?: Array<{
    itemId: string;
    quantity?: number;
    unitPrice?: number;
  }>;
  notes?: string;
  internalNotes?: string;
  modificationReason?: string;
}

interface ModifyOrderResponse {
  success: boolean;
  order: Order;
  message: string;
}

export const useModifyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ModifyOrderResponse, Error, { orderId: string; data: ModifyOrderData }>({
    mutationFn: async ({ orderId, data }) => {
      // FIXED: Use apiClient which handles auth tokens automatically
      const response = await apiClient.patch(`/admin/orders/${orderId}/modify`, data);
      return response.data;
    },
    onSuccess: (data, { orderId }) => {
      // Invalidate order queries
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};

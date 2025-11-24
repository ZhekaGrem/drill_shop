// shared/api/orders.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderWithRelations, Product, Address } from '@/shared/types/generated.types';

import { API_BASE } from '@/shared/api/client';

interface ModifyOrderPayload {
  guestEmail?: string;
  guestPhone?: string;
  guestFirstName?: string;
  guestLastName?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  addItems?: Array<{ productId: string; quantity: number; unitPrice: number }>;
  removeItemIds?: string[];
  updateItems?: Array<{ itemId: string; quantity: number; unitPrice: number }>;
  notes?: string;
  internalNotes?: string;
  modificationReason?: string;
}

interface SearchProductsParams {
  query: string;
  limit?: number;
}

// Get order details with all relations
export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<OrderWithRelations> => {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return response.json();
    },
    enabled: !!orderId,
  });
};

// Modify order endpoint
export const useModifyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: ModifyOrderPayload }) => {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}/modify`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to modify order');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate order details
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Search products for adding to order
export const useSearchProducts = () => {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }: SearchProductsParams): Promise<Product[]> => {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        status: 'ACTIVE',
        isActive: 'true',
      });

      const response = await fetch(`${API_BASE}/api/v1/products/search?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data = await response.json();
      return data.products || [];
    },
  });
};

// Get order history for audit trail
export const useOrderHistory = (orderId: string) => {
  return useQuery({
    queryKey: ['order-history', orderId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/v1/admin/orders/${orderId}/history`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      return response.json();
    },
    enabled: !!orderId,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      comment,
    }: {
      orderId: string;
      status: string;
      comment?: string;
    }) => {
      const response = await fetch(`${API_BASE}/api/v1/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-history', variables.orderId] });
    },
  });
};

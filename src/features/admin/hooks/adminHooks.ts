// src/features/admin/hooks/adminHooks.ts - ДОДАНО getProductById для повних даних з варіантами

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/auth';
import { notifications } from '@mantine/notifications';
export function useAdminGuard() {
  const { userProfile, isAuthenticated } = useAuthStore();

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
  const isManager = userProfile?.role === 'MANAGER' || isAdmin;

  return {
    isAdmin,
    isManager,
    user: userProfile,
    isAuthenticated,
    hasAccess: isAuthenticated && isManager,
    canManageUsers: isAdmin,
  };
}

// NEW: Get single product with full data including variants
export const useAdminProduct = (id: string) => {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, files }: { data: any; files?: File[] }) => {
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));

        files.forEach((file) => {
          formData.append('images', file);
        });

        const response = await apiClient.post('/admin/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      } else {
        const response = await apiClient.post('/admin/products', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: any; files?: File[] }) => {
      if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));

        files.forEach((file) => {
          formData.append('images', file);
        });

        const response = await apiClient.put(`/admin/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      } else {
        const response = await apiClient.put(`/admin/products/${id}`, data);
        return response.data;
      }
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

// Upload product images
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: FileList | File[] }) => {
      const formData = new FormData();
      const fileArray = Array.isArray(files) ? files : Array.from(files);

      fileArray.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post(`/admin/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
    },
    onError: (error: any) => {
      console.error('❌ Image upload error:', error.response?.data || error);
    },
  });
};

// Delete product image
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, imageId }: { productId: string; imageId: string }) => {
      const response = await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
      return response.data;
    },
    onSuccess: (result, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
    },
    onError: (error: any) => {
      console.error('❌ Delete image error:', error.response?.data || error);
    },
  });
};

// Dashboard
export function useAdminDashboard(filters: { period?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'dashboard', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.period) {
        params.append('period', filters.period);
      }

      const url = params.toString() ? `/admin/dashboard?${params}` : '/admin/dashboard';
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: useAdminGuard().hasAccess,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}

// Orders
export const useAdminOrders = (filters: any) => {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.limit) {
        params.append('limit', String(filters.limit));
      }

      if (filters.offset) {
        params.append('offset', String(filters.offset));
      }

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.paymentStatus) {
        params.append('paymentStatus', filters.paymentStatus);
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';

      const response = await apiClient.get(url);
      return response.data;
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment?: string }) => {
      const requestBody = {
        status,
        ...(comment && { comment }),
      };

      const response = await apiClient.patch(`/admin/orders/${id}/status`, requestBody);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      notifications.show({
        title: 'Успіх',
        message: 'Статус замовлення оновлено',
        color: 'green',
      });
    },
  });
};

// Update order payment status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
      comment,
    }: {
      id: string;
      paymentStatus: string;
      comment?: string;
    }) => {
      const requestBody = {
        paymentStatus,
        ...(comment && { comment }),
        notifyCustomer: false,
      };

      const response = await apiClient.patch(`/admin/orders/${id}/status`, requestBody);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      notifications.show({
        title: 'Успіх',
        message: 'Статус оплати оновлено',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Помилка',
        message: error?.response?.data?.message || 'Не вдалось оновити статус оплати',
        color: 'red',
      });
    },
  });
};

// Products
export const useAdminProducts = (filters: any) => {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      if (filters.limit) {
        params.append('limit', String(Math.min(Number(filters.limit), 100)));
      }

      if (filters.offset) {
        params.append('offset', String(filters.offset));
      }

      const queryString = params.toString();
      const url = queryString ? `/admin/products?${queryString}` : '/admin/products';

      const response = await apiClient.get(url);
      return response.data;
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};

// Users
export function useAdminUsers(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const url = params.toString() ? `/admin/users?${params}` : '/admin/users';
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: useAdminGuard().hasAccess,
    staleTime: 2 * 60 * 1000,
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; role: string }>({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await apiClient.put(`/admin/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({
        title: 'Успіх',
        message: 'Роль змінено',
        color: 'green',
      });
    },
  });
}

// Update user status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.put(`/admin/users/${id}/status`, {
        isActive,
        reason: 'Admin status change',
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({
        title: 'Успіх',
        message: variables.isActive ? 'Користувача активовано' : 'Користувача заблоковано',
        color: 'green',
      });
    },
  });
};

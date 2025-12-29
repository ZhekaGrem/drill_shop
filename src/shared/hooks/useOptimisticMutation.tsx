// src/shared/hooks/useOptimisticMutation.ts
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { showNotification } from '@/shared/utils/notifications';
import { IconX, IconCheck } from '@tabler/icons-react';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessNotification?: boolean;
}

/**
 * Хук для оптимістичних mutations з автоматичними нотифікаціями
 *
 * @example
 * const addItem = useOptimisticMutation({
 *   mutationFn: (data) => addToCart(data),
 *   onSuccess: async () => { await syncCart(); },
 *   errorMessage: 'Не вдалося додати товар',
 * });
 */
export const useOptimisticMutation = <TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage = 'Сталася помилка',
  showSuccessNotification = false,
}: OptimisticMutationOptions<TData, TVariables>) => {
  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      await onSuccess?.(data);

      if (showSuccessNotification && successMessage) {
        showNotification({
          message: successMessage,
        });
      }
    },
    onError: (error: any) => {
      showNotification({
        message: error.message || errorMessage,
        color: 'red',
      });

      onError?.(error);
    },
  });
};

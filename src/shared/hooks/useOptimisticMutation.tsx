// src/shared/hooks/useOptimisticMutation.ts
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
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
        notifications.show({
          message: successMessage,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
    },
    onError: (error: any) => {
      notifications.show({
        message: error.message || errorMessage,
        color: 'red',
        icon: <IconX size={16} />,
      });

      onError?.(error);
    },
  });
};

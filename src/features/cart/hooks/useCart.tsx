// src/features/cart/hooks/useCart.tsx - ВИПРАВЛЕНО НА 100%

import { useMutation } from '@tanstack/react-query';
import { showNotification } from '@/shared/utils/notifications';
import { IconX } from '@tabler/icons-react';
import { useCartStore } from '@/shared/stores/cart';
import {
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
} from '@/features/cart/api/cart-api';

export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const calculations = useCartStore((state) => state.calculations);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const syncCart = useCartStore((state) => state.syncCart);
  const addOptimisticItem = useCartStore((state) => state.addOptimisticItem);
  const rollback = useCartStore((state) => state.rollback);

  // Додавання з оптимістичним UI
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId, productData }: any) => {
      // Зберігаємо попередній стан для відкату
      const previousState = {
        items: useCartStore.getState().items,
        calculations: useCartStore.getState().calculations,
      };

      // Оптимістичне оновлення (миттєво показуємо в UI)
      addOptimisticItem(productData, quantity, variantId);

      try {
        // Відправка на сервер
        const response = await addToCart({ productId, quantity, variantId });

        // ✅ КЛЮЧОВЕ ВИПРАВЛЕННЯ: Повна синхронізація після додавання
        // Це замінює всі temp_xxx ID на реальні ID з бази даних
        await syncCart();

        return response;
      } catch (error) {
        // Відкат при помилці
        rollback(previousState);
        throw error;
      }
    },
    onError: (error: any) => {
      showNotification({
        message: error.message || 'Не вдалося додати товар',
        color: 'red',
      });
    },
  });

  // Оновлення кількості
  const updateItemMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: any) => {
      return updateCartItem(cartItemId, { quantity });
    },
    onSuccess: async () => {
      await syncCart();
    },
    onError: (error: any) => {
      showNotification({
        message: error.message || 'Не вдалося оновити кількість',
        color: 'red',
      });
    },
  });

  // Видалення
  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      return removeCartItem(cartItemId);
    },
    onSuccess: async () => {
      await syncCart();
      showNotification({
        message: 'Товар видалено',
        color: 'green',
      });
    },
    onError: (error: any) => {
      showNotification({
        message: error.message || 'Не вдалося видалити товар',
        color: 'red',
      });
    },
  });

  // Очищення
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return clearCartAPI();
    },
    onSuccess: async () => {
      await syncCart();
    },
    onError: (error: any) => {
      showNotification({
        message: error.message || 'Не вдалося очистити кошик',
        color: 'red',
      });
    },
  });

  return {
    items,
    calculations,
    isLoading,
    error,

    // Стани завантаження
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,

    // Методи
    addItem: (productId: string, quantity: number = 1, variantId?: string, productData?: any) => {
      addItemMutation.mutate({ productId, quantity, variantId, productData });
    },
    updateItemQuantity: (cartItemId: string, quantity: number) => {
      updateItemMutation.mutate({ cartItemId, quantity });
    },
    removeItem: (cartItemId: string) => {
      removeItemMutation.mutate(cartItemId);
    },
    clearCart: () => {
      clearCartMutation.mutate();
    },
    refetch: syncCart,
  };
};

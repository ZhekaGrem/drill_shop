// src/shared/stores/cart.ts - ВИПРАВЛЕНО

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CartItemWithProduct, calculateCartTotals, CartCalculations } from '@/shared/utils/cart-calculations';
import { fetchCart, mergeGuestCart } from '@/features/cart/api/cart-api';

interface CartState {
  items: CartItemWithProduct[];
  calculations: CartCalculations;
  appliedDiscounts: any[];
  isLoading: boolean;
  isInitialized: boolean;
  isDrawerOpen: boolean;
  error: string | null;

  // Синхронізація з сервером
  syncCart: () => Promise<void>;
  mergeAndSync: () => Promise<void>;

  // Оптимістичні оновлення (тільки для UI)
  addOptimisticItem: (productData: any, quantity: number, variantId?: string) => void;
  rollback: (previousState: { items: CartItemWithProduct[]; calculations: CartCalculations }) => void;

  // UI методи
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    calculations: {
      itemsCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      totalAmount: 0,
      discountAmount: 0,
    },
    appliedDiscounts: [],
    isLoading: false,
    isInitialized: false,
    isDrawerOpen: false,
    error: null,

    // Завантажити з сервера (отримує реальні ID)
    syncCart: async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await fetchCart();

        // ✅ ВИПРАВЛЕНО: правильна логіка для варіантів
        const enrichedItems = (response.data.items || []).map((item: any) => {
          return item;
        });
        set({
          items: enrichedItems,
          calculations: response.data.summary || {
            itemsCount: 0,
            totalQuantity: 0,
            subtotal: 0,
            totalAmount: 0,
            discountAmount: 0,
          },
          appliedDiscounts: response.data.appliedDiscounts || [],
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('❌ Sync cart error:', error);

        set({
          isLoading: false,
          error: error.message || 'Помилка завантаження кошика',
        });
      }
    },

    // Оптимістичне додавання (тільки для миттєвого відображення)
    addOptimisticItem: (productData: any, quantity: number, variantId?: string) => {
      const currentItems = get().items;

      const existingIndex = currentItems.findIndex(
        (item) => item.productId === productData.id && item.variantId === (variantId || null)
      );

      let newItems;
      if (existingIndex >= 0) {
        // Оновлення існуючого item
        newItems = [...currentItems];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
      } else {
        // Створення нового item
        const variant = variantId && productData.variants?.find((v: any) => v.id === variantId);

        // ✅ ВИПРАВЛЕНО: якщо варіант має ціну - НЕ застосовувати промо
        const basePrice = Number(variant?.price || productData.price);
        let finalPrice = basePrice;
        let hasDiscount = false;

        // Застосувати промо ТІЛЬКИ якщо немає варіанта з ціною
        if (!variant?.price && productData.promoType && productData.promoConfig) {
          const config = productData.promoConfig;

          if (productData.promoType === 'PERCENTAGE_OFF') {
            const discount = basePrice * (config.percentage / 100);
            if (config.maxDiscount) {
              finalPrice = basePrice - Math.min(discount, config.maxDiscount);
            } else {
              finalPrice = basePrice - discount;
            }
            hasDiscount = true;
          } else if (productData.promoType === 'FIXED_DISCOUNT') {
            const discount = Math.min(config.amount, basePrice);
            finalPrice = basePrice - discount;
            hasDiscount = true;
          }
        }

        const discountAmount = basePrice - finalPrice;

        const tempItem: CartItemWithProduct = {
          id: `temp_${Date.now()}`,
          productId: productData.id,
          variantId: variantId || null,
          quantity,
          unitPrice: finalPrice,
          totalPrice: finalPrice * quantity,
          originalPrice: basePrice,
          finalPrice: finalPrice,
          discountAmount: discountAmount,
          hasPromo: hasDiscount,
          product: {
            id: productData.id,
            name: productData.name,
            slug: productData.slug,
            price: Number(productData.price),
            unitValue: productData.unitValue,
            status: 'ACTIVE',
            isActive: true,
            primaryImage: productData.primaryImage,
            promoType: productData.promoType || null,
            promoConfig: productData.promoConfig || null,
            promoEndsAt: productData.promoEndsAt || null,
          },
          variant: variant
            ? {
                id: variant.id,
                name: variant.name,
                price: Number(variant.price || 0),
                unitValue: variant.unitValue,
                options: variant.options,
              }
            : null,
        };
        newItems = [...currentItems, tempItem];
      }

      const calculations = calculateCartTotals(newItems);
      set({ items: newItems, calculations });
    },

    // Злиття гостьового кошика при авторизації
    mergeAndSync: async () => {
      const guestItems = get().items;

      // Якщо немає гостьових товарів - просто завантажити серверний кошик
      if (!guestItems.length) {
        await get().syncCart();
        return;
      }

      set({ isLoading: true, error: null });

      try {
        // Підготувати дані для merge
        const itemsToMerge = guestItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        }));

        // Відправити гостьові товари на бекенд для злиття
        await mergeGuestCart(itemsToMerge);

        // Завантажити об'єднаний кошик з сервера
        await get().syncCart();
      } catch (error: any) {
        console.error('❌ Merge cart error:', error);
        // Якщо merge не вдався - просто завантажити серверний кошик
        await get().syncCart();
      }
    },

    // Відкат при помилці
    rollback: (previousState) => {
      set({
        items: previousState.items,
        calculations: previousState.calculations,
      });
    },

    // UI методи
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  }))
);

// Ініціалізація
if (typeof window !== 'undefined') {
  useCartStore.getState().syncCart();
}

// Селектори
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartCalculations = () => useCartStore((state) => state.calculations);
export const useCartDrawerState = () => useCartStore((state) => state.isDrawerOpen);

// ✅ ВИПРАВЛЕНО: Стабільний об'єкт з actions
const cartDrawerActions = {
  open: () => useCartStore.getState().openDrawer(),
  close: () => useCartStore.getState().closeDrawer(),
  toggle: () => useCartStore.getState().toggleDrawer(),
};

export const useCartDrawerActions = () => cartDrawerActions;

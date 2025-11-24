// src/shared/stores/favorites.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '@/shared/api';
import { userEndpoints } from '@/shared/api/endpoints';
import { Product } from '@/shared/types';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from './auth';

// localStorage ключ для гостей
const FAVORITES_STORAGE_KEY = 'guest_favorites';

// Утиліти для localStorage
const getFavoritesFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (items: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
  }
};

interface FavoritesState {
  items: Set<string>;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  setItems: (items: string[]) => void;
  toggleFavorite: (product: Product) => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    (set, get) => ({
      items: new Set(),
      isInitialized: false,

      // Ініціалізація обраного (localStorage для гостей)
      initialize: () => {
        if (get().isInitialized) return;

        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // Для гостей - завантажуємо з localStorage
          const guestFavorites = getFavoritesFromStorage();
          set({
            items: new Set(guestFavorites),
            isInitialized: true,
          });
        } else {
          // Для авторизованих - дані завантажуються в AuthProvider
          set({ isInitialized: true });
        }
      },

      // Встановлення елементів обраного (використовується в AuthProvider)
      setItems: (items: string[]) => {
        set({
          items: new Set(items),
          isInitialized: true,
        });
      },

      // Toggle обране з оптимістичним оновленням
      toggleFavorite: async (product: Product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const originalItems = new Set(get().items);
        const newItems = new Set(originalItems);
        const isCurrentlyFavorite = newItems.has(product.id);

        // Оптимістичне оновлення
        if (isCurrentlyFavorite) {
          newItems.delete(product.id);
        } else {
          newItems.add(product.id);
        }
        set({ items: newItems });

        if (!isAuthenticated) {
          // Для гостей - зберігаємо в localStorage
          saveFavoritesToStorage(Array.from(newItems));

          return;
        }

        // Для авторизованих - синхронізація з сервером
        try {
          await apiClient.post(userEndpoints.toggleFavorite, { productId: product.id });
        } catch (error) {
          // Відкат у разі помилки
          set({ items: originalItems });
          notifications.show({
            title: 'Помилка',
            message: 'Не вдалося оновити обране.',
            color: 'red',
          });
        }
      },

      // Очищення обраного
      clearFavorites: () => {
        set({ items: new Set(), isInitialized: true });

        // Очищаємо localStorage для гостей
        if (typeof window !== 'undefined') {
          localStorage.removeItem(FAVORITES_STORAGE_KEY);
        }
      },
    }),
    { name: 'favorites-store' }
  )
);

// src/shared/stores/telegram-auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/shared/api/client';
import type { TelegramUser } from '@/shared/utils/telegram';

export interface TelegramUserProfile {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  isPremium?: boolean;
  role: string;
  isActive: boolean;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

interface TelegramAuthState {
  // Telegram user data
  telegramUser: TelegramUser | null;
  userProfile: TelegramUserProfile | null;

  // Init data для авторизації
  initData: string | null;

  // Статус
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (telegramUser: TelegramUser, initData: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (profile: TelegramUserProfile) => void;
  loadProfile: () => Promise<void>;
}

const PROFILE_CACHE_KEY = 'telegram_profile_cache';

const getCachedProfile = (): TelegramUserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCachedProfile = (profile: TelegramUserProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch (error) {
    console.error('❌ Failed to cache Telegram profile:', error);
  }
};

export const useTelegramAuthStore = create<TelegramAuthState>()(
  persist(
    (set, get) => ({
      telegramUser: null,
      userProfile: null,
      initData: null,
      isLoading: false,
      isInitialized: false,
      isAuthenticated: false,

      initialize: async () => {
        if (get().isInitialized) return;

        try {
          const cachedProfile = getCachedProfile();
          if (cachedProfile) {
            set({
              userProfile: cachedProfile,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('❌ Telegram initialize error:', error);
        } finally {
          set({ isInitialized: true });
        }
      },

      login: async (telegramUser: TelegramUser, initData: string) => {
        set({ isLoading: true });

        try {
          // Відправляємо initData на backend для валідації
          const response = await apiClient.post(
            '/telegram/auth/login',
            {},
            {
              headers: {
                'X-Telegram-Init-Data': initData,
              },
            }
          );

          if (!response.data.success) {
            throw new Error(response.data.message || 'Telegram auth failed');
          }

          const profile = response.data.data;

          set({
            telegramUser,
            userProfile: profile,
            initData,
            isAuthenticated: true,
          });

          setCachedProfile(profile);

          // Завантажуємо favorites та cart у фоні
          try {
            const favoritesRes = await apiClient.get('/profile/favorites');
            if (favoritesRes.data?.data) {
              const { useFavoritesStore } = await import('./favorites');
              useFavoritesStore.getState().setItems(favoritesRes.data.data);
            }

            const { useCartStore } = await import('./cart');
            await useCartStore.getState().syncCart();
          } catch (error) {
            console.error('❌ Failed to load Telegram user data:', error);
          }
        } catch (error: any) {
          console.error('❌ Telegram login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({
            telegramUser: null,
            userProfile: null,
            initData: null,
            isAuthenticated: false,
          });

          setCachedProfile(null);

          // Очищаємо favorites та cart
          const { useFavoritesStore } = await import('./favorites');
          const { useCartStore } = await import('./cart');

          useFavoritesStore.getState().clearFavorites();
          useCartStore.setState({
            items: [],
            calculations: {
              itemsCount: 0,
              totalQuantity: 0,
              subtotal: 0,
              totalAmount: 0,
              discountAmount: 0,
            },
          });
        } catch (error) {
          console.error('❌ Telegram logout failed:', error);
        }
      },

      setUser: (profile: TelegramUserProfile) => {
        set({ userProfile: profile });
        setCachedProfile(profile);
      },

      loadProfile: async () => {
        try {
          const response = await apiClient.get('/telegram/auth/profile');

          if (response.data.success && response.data.data) {
            const profile = response.data.data;
            set({ userProfile: profile });
            setCachedProfile(profile);
            return profile;
          }
        } catch (error: any) {
          console.error('❌ Load Telegram profile error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'telegram-auth-storage',
      partialize: (state) => ({
        telegramUser: state.telegramUser,
        initData: state.initData,
      }),
    }
  )
);

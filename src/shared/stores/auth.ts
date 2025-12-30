// src/shared/stores/auth.ts - FIXED (з кешем та централізованим завантаженням)
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/shared/utils/supabase/client';
import { apiClient } from '@/shared/api/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  handleAuthChange: (user: SupabaseUser | null, session: Session | null) => void;
  loadProfile: () => Promise<void>;
  setUser: (profile: UserProfile) => void;
  reloadProfile: () => Promise<void>;
  refreshToken: () => Promise<Session | null>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const PROFILE_CACHE_KEY = 'user_profile_cache';
let profileLoadingPromise: Promise<any> | null = null;
// Helpers для localStorage
const getCachedProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCachedProfile = (profile: UserProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch (error) {
    console.error('❌ Failed to cache profile:', error);
  }
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      supabaseUser: null,
      session: null,
      userProfile: null,
      isLoading: false,
      isInitialized: false,
      isAuthenticated: false,

      // ЦЕНТРАЛІЗОВАНЕ завантаження профілю
      loadProfile: async (accessToken?: string) => {
        const currentSession = get().session;
        if (profileLoadingPromise) {
          return profileLoadingPromise;
        }

        profileLoadingPromise = (async () => {
          try {
            const config = currentSession?.access_token
              ? { headers: { Authorization: `Bearer ${currentSession.access_token}` } }
              : {};
            const response = await apiClient.get('/auth/profile', config);

            if (response.data.success && response.data.data) {
              const profile = response.data.data;

              set({ userProfile: profile });
              setCachedProfile(profile);

              return profile;
            }
          } catch (error: any) {
            console.error('❌ [PROFILE] Load error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
            });

            throw error;
          } finally {
            profileLoadingPromise = null;
          }
        })();

        return profileLoadingPromise;
      },

      // ПОСЛІДОВНА ініціалізація
      initialize: async () => {
        if (get().isInitialized) return;

        try {
          // 1. Отримуємо сесію
          // 1. Отримуємо сесію з timeout
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('getSession timeout')), 3000)
          );

          const result = (await Promise.race([sessionPromise, timeoutPromise]).catch((err) => {
            console.warn('⚠️ [INITIALIZE] getSession failed:', err.message);
            return { data: { session: null } };
          })) as { data: { session: any } };

          const session = result.data.session;

          if (session?.user) {
            // 2. Встановлюємо сесію в store
            set({
              supabaseUser: session.user,
              session,
              isAuthenticated: true,
            });

            // 3. Завантажуємо кеш ОДРАЗУ (для швидкого UI)
            const cachedProfile = getCachedProfile();
            if (cachedProfile && cachedProfile.id === session.user.id) {
              set({ userProfile: cachedProfile });
            }
            const { setTempAccessToken } = await import('@/shared/api/client');
            setTempAccessToken(session.access_token);

            // 4. Завантажуємо favorites в фоні (не блокуємо UI)
            (async () => {
              try {
                const favoritesRes = await apiClient.get('/profile/favorites');
                if (favoritesRes.data?.data) {
                  const { useFavoritesStore } = await import('./favorites');
                  useFavoritesStore.getState().setItems(favoritesRes.data.data);
                }
              } catch (error) {
                console.error('❌ [INITIALIZE] Failed to load favorites:', error);
              }
            })();

            // 5. 💡 ФІКС: Завантажуємо актуальний профіль у фоні, якщо він не був у кеші
            if (!cachedProfile || cachedProfile.id !== session.user.id) {
              get()
                .loadProfile()
                .catch((error) => {
                  console.warn('⚠️ [INITIALIZE] Failed to load fresh profile in background:', error);
                });
            }
          } else {
            // Гість - очищаємо все
            set({
              supabaseUser: null,
              session: null,
              userProfile: null,
              isAuthenticated: false,
              isInitialized: false,
            });
            setCachedProfile(null);
          }
        } catch (error) {
          console.error('❌ Initialize error:', error);
        } finally {
          set({ isInitialized: true });
        }
      },
      //встановлення сесії (без API запитів)
      handleAuthChange: (user, session) => {
        if (session?.access_token) {
          const setToken = async () => {
            const { setTempAccessToken } = await import('@/shared/api/client');
            setTempAccessToken(session.access_token);
          };
          setToken();
        }
        set({
          supabaseUser: user,
          session,
          isAuthenticated: !!user && !!session,
        });

        if (!user) {
          // Logout - очищаємо профіль та кеш
          set({ userProfile: null });
          setCachedProfile(null);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('❌ [LOGIN] Supabase auth error:', error);
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Неправильний email або пароль');
            }
            if (error.message.includes('Email not confirmed')) {
              throw new Error('Підтвердіть email перед входом');
            }
            throw new Error(error.message);
          }

          if (data.session) {
            set({
              supabaseUser: data.user,
              session: data.session,
              isAuthenticated: true,
            });
            const { setTempAccessToken } = await import('@/shared/api/client');
            setTempAccessToken(data.session.access_token);
            let profile = get().userProfile;

            if (!profile) {
              try {
                await get().loadProfile();
                profile = get().userProfile;
              } catch (err) {
                console.warn('⚠️ Profile load failed, will retry in background');
              }
            }

            try {
              const [favoritesRes] = await Promise.allSettled([apiClient.get('/profile/favorites')]);

              if (favoritesRes.status === 'fulfilled' && favoritesRes.value.data?.data) {
                const { useFavoritesStore } = await import('./favorites');
                useFavoritesStore.getState().setItems(favoritesRes.value.data.data);
              }

              const { useCartStore } = await import('./cart');
              await useCartStore.getState().mergeAndSync();
            } catch (error) {
              console.error('❌ [LOGIN] Failed to load user data:', error);
              // ✅ НЕ падаємо - дозволяємо юзеру залогінитись навіть якщо favorites/cart не завантажились
            }
          }
        } catch (error: any) {
          console.error('❌ [LOGIN] Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          const response = await apiClient.post('/auth/register', {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || undefined,
          });

          if (!response.data.success) {
            throw new Error(response.data.message || 'Помилка реєстрації');
          }

          // ✅ Автологін після успішної реєстрації
          await get().login(data.email, data.password);
        } catch (error: any) {
          console.error('❌ Registration error:', error);

          if (error.response?.data?.code === 'EMAIL_EXISTS') {
            throw new Error('Користувач з таким email вже існує');
          }
          if (error.response?.data?.code === 'INVALID_EMAIL') {
            throw new Error('Неіснуючий email адрес');
          }

          throw new Error(error.message || 'Помилка реєстрації');
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();

          set({
            supabaseUser: null,
            session: null,
            userProfile: null,
            isAuthenticated: false,
          });

          setCachedProfile(null);
          const { setTempAccessToken, clearAuthCache } = await import('@/shared/api/client');
          setTempAccessToken(null);
          clearAuthCache(); // ✅ Очищаємо кеш токенів
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
          console.error('❌ Logout failed:', error);
        }
      },

      setUser: (profile: UserProfile) => {
        set({ userProfile: profile });
        setCachedProfile(profile);
      },
      reloadProfile: async () => {
        set({ isLoading: true });

        try {
          await get().loadProfile();
        } catch (error) {
          console.error('❌ [PROFILE] Reload failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      refreshToken: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();

          if (error || !data.session) {
            throw error || new Error('No session after refresh');
          }

          set({
            session: data.session,
            supabaseUser: data.user,
            isAuthenticated: true,
          });

          return data.session;
        } catch (error) {
          console.error('❌ Refresh token error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);

// src/shared/api/client.ts - OPTIMIZED
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { supabase } from '@/shared/utils/supabase/client';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL;
let tempAccessToken: string | null = null;

// ✅ ФІКС CPU: Кешування токенів для зменшення getSession викликів
let cachedToken: { token: string | null; expiresAt: number } | null = null;
const TOKEN_CACHE_TTL = 60000; // 1 хвилина

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Налаштування retry логіки з exponential backoff для Rate Limit (429)
axiosRetry(apiClient, {
  retries: 5, // Максимум 5 повторних спроб
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
  },
  retryCondition: (error) => {
    // Retry на 429 (Too Many Requests) та 5xx помилки
    return (
      error.response?.status === 429 || (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, error) => {
    console.log(`Retrying request (attempt ${retryCount}) due to ${error.response?.status} error`);
  },
});
export const setTempAccessToken = (token: string | null) => {
  tempAccessToken = token;
  // Очищаємо кеш при зміні temp токена
  cachedToken = null;
};

// ✅ Очищення кешу при logout
export const clearAuthCache = () => {
  cachedToken = null;
};

// Додаємо токен до кожного запиту (ОПТИМІЗОВАНО)
apiClient.interceptors.request.use(
  async (config) => {
    if (config.headers.Authorization) {
      return config;
    }
    if (tempAccessToken) {
      config.headers.Authorization = `Bearer ${tempAccessToken}`;
      return config;
    }

    // ✅ ФІКС CPU: Перевіряємо кеш перед викликом getSession
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now) {
      if (cachedToken.token) {
        config.headers.Authorization = `Bearer ${cachedToken.token}`;
      } else {
        // Guest session з кешу
        const sessionId = localStorage.getItem('guestSessionId');
        if (sessionId) {
          config.headers['X-Session-ID'] = sessionId;
        }
      }
      return config;
    }

    try {
      // Тільки якщо кеш протух - робимо getSession
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // ✅ Кешуємо результат
      cachedToken = {
        token: session?.access_token || null,
        expiresAt: now + TOKEN_CACHE_TTL,
      };

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        // Для гостей (створюємо один раз)
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
          sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('guestSessionId', sessionId);
        }
        config.headers['X-Session-ID'] = sessionId;
      }
    } catch (error) {
      // Ігноруємо помилки - йде запит без токена
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Обробка відповідей
apiClient.interceptors.response.use(
  (response) => {
    // Перевірка success: false у відповіді
    if (response.data && response.data.success === false) {
      const error: any = new Error(response.data.message || 'Request failed');
      error.response = response;
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    const originalRequest = error.config;

    // Якщо 401 і ще не робили retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Спробуємо оновити токен
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && data.session) {
          // ✅ Оновлюємо кеш з новим токеном
          cachedToken = {
            token: data.session.access_token,
            expiresAt: Date.now() + TOKEN_CACHE_TTL,
          };
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Токен не оновився - очищаємо сесію та кеш
        if (typeof window !== 'undefined') {
          clearAuthCache();
          await supabase.auth.signOut();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

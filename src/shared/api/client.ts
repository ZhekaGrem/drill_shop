// src/shared/api/client.ts - SIMPLE
import axios from 'axios';
import { supabase } from '@/shared/utils/supabase/client';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL;
let tempAccessToken: string | null = null;
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const setTempAccessToken = (token: string | null) => {
  tempAccessToken = token;
};
// Додаємо токен до кожного запиту
apiClient.interceptors.request.use(
  async (config) => {
    if (config.headers.Authorization) {
      return config;
    }
    if (tempAccessToken) {
      config.headers.Authorization = `Bearer ${tempAccessToken}`;
      return config;
    }
    try {
      // Простий підхід - завжди беремо свіжий токен
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      );

      const {
        data: { session },
      } = (await Promise.race([sessionPromise, timeoutPromise]).catch(() => ({
        data: { session: null },
      }))) as { data: { session: any } };
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        // Для гостей
        const sessionId =
          localStorage.getItem('guestSessionId') ||
          `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        localStorage.setItem('guestSessionId', sessionId);
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
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Токен не оновився - юзер має залогінитись
      }

      // Перенаправляємо на логін
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

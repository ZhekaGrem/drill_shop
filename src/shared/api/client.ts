// src/shared/api/client.ts - OPTIMIZED
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { supabase } from '@/shared/utils/supabase/client';

// Бекенд пускає CORS лише зі своїх доменів і localhost. Сайт мобільний, і в
// розробці телефон відкриває його по LAN-адресі (192.168.x.x) — з такого
// origin API відповідає 500 без CORS-заголовків, тобто на телефоні мовчки
// відвалюються ВСІ дані. Тому в браузері в dev ходимо через same-origin
// проксі Next (rewrites у next.config.ts): для API запит приходить із самого
// сервера, CORS не діє. Сервер-рендер і прод — прямий абсолютний URL.
export const API_BASE =
  process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.NEXT_PUBLIC_API_URL;
let tempAccessToken: string | null = null;

// ✅ ФІКС CPU: Кешування токенів для зменшення getSession викликів
let cachedToken: { token: string | null; expiresAt: number } | null = null;
const TOKEN_CACHE_TTL = 60000; // 1 хвилина

/**
 * Id гостьової сесії. Він же ключ до кошика на бекенді, тому має бути
 * непередбачуваним: із Math.random() чужу сесію можна підібрати.
 *
 * randomUUID доступний лише в secure context (https або localhost), а дев-сервер
 * відкривають ще й по LAN-адресі з телефона — там лишається getRandomValues,
 * який працює і без secure context.
 */
function generateGuestSessionId(): string {
  const c = globalThis.crypto;

  if (typeof c?.randomUUID === 'function') {
    return `guest_${c.randomUUID()}`;
  }

  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `guest_${hex}`;
}

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
    // ✅ PRIORITY 1: Перевіряємо чи є вже X-Telegram-Init-Data (для Telegram запитів)
    if (config.headers['X-Telegram-Init-Data']) {
      return config;
    }

    // ✅ PRIORITY 2: Перевіряємо чи запущено в Telegram (для /telegram роутів)
    if (typeof window !== 'undefined') {
      try {
        const { getTelegramInitData, isTelegramWebApp } = await import('@/shared/utils/telegram');

        if (isTelegramWebApp()) {
          const initData = getTelegramInitData();
          if (initData) {
            config.headers['X-Telegram-Init-Data'] = initData;
            return config;
          }
        }
      } catch (error) {
        // Telegram утиліти не завантажились - продовжуємо з Supabase auth
      }
    }

    // ✅ PRIORITY 3: Supabase auth для web користувачів
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
      } else if (typeof window !== 'undefined') {
        // Guest session з кешу (тільки на клієнті)
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
      } else if (typeof window !== 'undefined') {
        // Для гостей (створюємо один раз, тільки на клієнті)
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
          sessionId = generateGuestSessionId();
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

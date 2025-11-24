// src/shared/config/react-query.ts

/**
 * Стандартні налаштування для React Query
 * Використовуються в усіх useQuery hooks для консистентності
 */
export const queryDefaults = {
  staleTime: 30 * 60 * 1000, // 30 хвилин - дані вважаються свіжими
  gcTime: 60 * 60 * 1000, // 1 година - зберігання в кеші
  refetchOnWindowFocus: false, // Не рефетчити при фокусі вікна
  refetchOnReconnect: false, // Не рефетчити при з'єднанні
  retry: 1, // Одна спроба повтору
  retryDelay: 1000, // 1 секунда між спробами
} as const;

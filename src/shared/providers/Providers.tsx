// src/shared/providers/Providers.tsx - ОПТИМІЗОВАНО
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useState } from 'react';
import '@mantine/notifications/styles.css';
import { AuthProvider } from './AuthProvider';
import { mantineTheme } from '@/shared/config/mantine-theme';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ЗБІЛЬШЕНО час актуальності даних
            staleTime: 30 * 60 * 1000, // 30 хвилин - дані вважаються свіжими
            gcTime: 60 * 60 * 1000, // 1 година - час зберігання в кеші
            refetchOnWindowFocus: false, // Не оновлювати при фокусі
            refetchOnReconnect: false, // Не оновлювати при reconnect
            retry: 1, // Тільки 1 retry
            retryDelay: 1000, // 1 секунда між retry
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={mantineTheme} defaultColorScheme="light">
        <Notifications position="top-right" zIndex={2077} />
        <AuthProvider>{children}</AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

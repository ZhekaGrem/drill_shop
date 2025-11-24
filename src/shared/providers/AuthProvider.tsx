// src/shared/providers/AuthProvider.tsx - СПРОЩЕНО
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/shared/stores/auth';
import { supabase } from '@/shared/utils/supabase/client';
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { initialize, handleAuthChange } = useAuthStore();

  useEffect(() => {
    // Одноразова ініціалізація при mount
    initialize();

    // Слухаємо зміни auth стану
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Тільки встановлюємо сесію (без завантаження профілю)
      handleAuthChange(session?.user || null, session);

      // Якщо SIGN_IN - завантажуємо профіль
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, handleAuthChange]);

  return <>{children}</>;
};

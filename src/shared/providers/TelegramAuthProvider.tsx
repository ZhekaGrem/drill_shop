'use client';

import { useEffect } from 'react';
import { useTelegram } from './TelegramProvider';
import { useTelegramAuthStore } from '@/shared/stores/telegram-auth';

export function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const { isReady, isTelegramEnv, user: tgUser, initData: tgInitData } = useTelegram();
  const { login, initialize, isInitialized } = useTelegramAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    const authenticateTelegram = async () => {
      console.log('🔐 TelegramAuth: Starting authentication...');

      try {
        if (!isTelegramEnv) {
          console.log('ℹ️ TelegramAuth: Not running in Telegram environment');
          return;
        }

        if (!tgUser || !tgInitData) {
          console.error('❌ TelegramAuth: Telegram data not available');
          return;
        }

        console.log('✅ TelegramAuth: User authenticated via Telegram', {
          telegramId: tgUser.id,
          firstName: tgUser.first_name,
          username: tgUser.username,
        });

        // Синхронізація з backend
        try {
          await login(tgUser, tgInitData);
          console.log('✅ TelegramAuth: Backend sync successful');
        } catch (error) {
          console.warn('⚠️ TelegramAuth: Backend sync failed:', error);
        }
      } catch (error) {
        console.error('❌ TelegramAuth: Authentication failed:', error);
      }
    };

    if (isReady && isTelegramEnv) {
      authenticateTelegram();
    }
  }, [isReady, isTelegramEnv, tgUser, tgInitData, login]);

  return <>{children}</>;
}

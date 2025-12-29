'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { TelegramUser } from '@/shared/utils/telegram';

// Типи для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  showAlert: (message: string) => void;
  showPopup: (params: any) => void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  version: string;
  platform: string;
  themeParams: any;
  HapticFeedback: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
    selectionChanged: () => void;
  };
}

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  initData: string;
  isReady: boolean;
  isTelegramEnv: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  initData: '',
  isReady: false,
  isTelegramEnv: false,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      // Перевіряємо чи додаток запущено в Telegram
      const telegram = typeof window !== 'undefined' ? window.Telegram : null;
      const isTelegram = telegram?.WebApp;
      setIsTelegramEnv(!!isTelegram);

      if (isTelegram) {
        // Динамічний імпорт SDK для уникнення SSR проблем
        const { default: WebApp } = await import('@twa-dev/sdk');

        // Ініціалізація Telegram WebApp
        WebApp.ready();
        WebApp.expand();

        // Налаштування UI
        WebApp.setHeaderColor('#ffffff');
        WebApp.setBackgroundColor('#f5f5f5');

        // Увімкнути підтвердження закриття
        WebApp.enableClosingConfirmation();

        setIsReady(true);

        console.log('✅ Telegram WebApp initialized:', {
          version: WebApp.version,
          platform: WebApp.platform,
          user: WebApp.initDataUnsafe.user,
        });
      } else {
        console.log('ℹ️ Running in web mode (not Telegram)');
        setIsReady(true);
      }
    };

    initTelegram();
  }, []);

  const value: TelegramContextValue = {
    webApp: isTelegramEnv && typeof window !== 'undefined' ? window.Telegram?.WebApp || null : null,
    user:
      isTelegramEnv && typeof window !== 'undefined'
        ? (window.Telegram?.WebApp?.initDataUnsafe?.user as TelegramUser) || null
        : null,
    initData: isTelegramEnv && typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData || '' : '',
    isReady,
    isTelegramEnv,
  };

  // Відображаємо контент тільки коли готово
  if (!isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export const useTelegram = () => useContext(TelegramContext);

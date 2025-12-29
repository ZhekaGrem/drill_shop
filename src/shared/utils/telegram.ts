// src/shared/utils/telegram.ts

/**
 * Telegram User типи
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Перевірка, чи запущено додаток в Telegram
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;

  const telegram = (window as any).Telegram;
  return !!telegram?.WebApp?.initData;
}

/**
 * Отримати initData для авторизації
 */
export function getTelegramInitData(): string | null {
  if (!isTelegramWebApp()) {
    return null;
  }

  const telegram = (window as any).Telegram;
  return telegram?.WebApp?.initData || null;
}

/**
 * Отримати дані користувача Telegram
 */
export function getTelegramUser(): TelegramUser | null {
  if (!isTelegramWebApp()) {
    return null;
  }

  const telegram = (window as any).Telegram;
  const user = telegram?.WebApp?.initDataUnsafe?.user;
  return user || null;
}

/**
 * Ініціалізація Telegram WebApp (викликати при старті додатку)
 */
export async function initTelegramWebApp() {
  if (isTelegramWebApp()) {
    const { default: WebApp } = await import('@twa-dev/sdk');

    WebApp.ready();
    WebApp.expand();

    // Налаштування теми
    WebApp.setHeaderColor('bg_color');
    WebApp.setBackgroundColor('#ffffff');

    console.log('✅ Telegram WebApp initialized');
  }
}

/**
 * Показати Telegram alert
 */
export async function showTelegramAlert(message: string) {
  if (isTelegramWebApp()) {
    const { default: WebApp } = await import('@twa-dev/sdk');
    WebApp.showAlert(message);
  } else {
    alert(message);
  }
}

/**
 * Показати Telegram popup
 */
export async function showTelegramPopup(params: {
  title?: string;
  message: string;
  buttons?: Array<{
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text?: string;
  }>;
}) {
  if (isTelegramWebApp()) {
    const { default: WebApp } = await import('@twa-dev/sdk');
    WebApp.showPopup(params as any);
  } else {
    alert(params.message);
  }
}

/**
 * Закрити Telegram WebApp
 */
export async function closeTelegramWebApp() {
  if (isTelegramWebApp()) {
    const { default: WebApp } = await import('@twa-dev/sdk');
    WebApp.close();
  }
}

/**
 * Haptic feedback
 */
export async function triggerHapticFeedback(
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
) {
  if (isTelegramWebApp()) {
    const { default: WebApp } = await import('@twa-dev/sdk');

    if (type === 'impact' && style) {
      WebApp.HapticFeedback.impactOccurred(style as any);
    } else if (type === 'notification' && style) {
      WebApp.HapticFeedback.notificationOccurred(style as any);
    } else if (type === 'selection') {
      WebApp.HapticFeedback.selectionChanged();
    }
  }
}

/**
 * Отримати Telegram theme params
 */
export function getTelegramThemeParams() {
  if (isTelegramWebApp()) {
    const telegram = (window as any).Telegram;
    return telegram?.WebApp?.themeParams || null;
  }
  return null;
}

/**
 * Перевірити чи користувач Premium
 */
export function isTelegramPremium(): boolean {
  const user = getTelegramUser();
  return user?.is_premium || false;
}

// src/features/news/hooks/useNewsSeen.ts
// Мітка «прочитано»: id останньої новини, яку людина відкривала. Лежить у
// localStorage цього браузера — жодного профілю й жодного запиту.
//
// useSyncExternalStore, а не useState+useEffect: localStorage на сервері не
// існує, і читати його треба саме як зовнішнє сховище (той самий прийом, що
// в useDesignChoice). Серверний знімок навмисно віддає id останньої новини,
// тобто «усе прочитано»: сервер малює слот БЕЗ дзвіночка, гідрація сходиться,
// а вже в браузері дзвіночок зʼявляється, якщо новина справді нова. Стрибка
// макета нема — кнопки слота лежать одна на одній у квадраті 44×44.
'use client';

import { useSyncExternalStore } from 'react';
import { NEWS, hasUnreadNews, latestNews } from '@/shared/config/news';

const SEEN_KEY = 'news-seen';
/** Своя подія: запис у сховище не сповіщає власну вкладку */
const SEEN_EVENT = 'news-seen-change';

const subscribe = (onChange: () => void) => {
  window.addEventListener(SEEN_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(SEEN_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

const readSeen = (): string | null => {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    // Приватний режим або заборонене сховище: вважаємо, що все прочитано —
    // краще не показати дзвіночок, ніж показувати його вічно
    return latestNews()?.id ?? null;
  }
};

/** Знімок для сервера: рядок (стабільний за значенням), який дає «прочитано» */
const serverSeen = (): string | null => latestNews()?.id ?? null;

/** Є непрочитана новина. На сервері завжди false. */
export const useUnreadNews = (): boolean =>
  hasUnreadNews(useSyncExternalStore(subscribe, readSeen, serverSeen), NEWS);

/** Позначити все прочитаним (викликається при відкритті шторки) */
export const markNewsSeen = () => {
  const latest = latestNews();
  if (!latest) return;
  try {
    localStorage.setItem(SEEN_KEY, latest.id);
  } catch {
    // Сховище недоступне — дзвіночок просто лишиться до перезавантаження
  }
  window.dispatchEvent(new Event(SEEN_EVENT));
};

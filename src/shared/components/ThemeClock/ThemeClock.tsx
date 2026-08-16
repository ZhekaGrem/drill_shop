// src/shared/components/ThemeClock/ThemeClock.tsx
// Безголовий доглядач авто-теми: поки нема явного вибору в localStorage,
// щохвилини звіряє тему з правилом активної дизайн-концепції (годинник 18:00 /
// системна / завжди темна) — перемикання живе без перезавантаження
// (інлайн-скрипт у layout спрацьовує лише на старті документа). Зміну
// системної теми (Cupertino) ловимо одразу через matchMedia. Ручне керування —
// дев-панель /v2/dev.
'use client';

import { useEffect } from 'react';
import { THEME_KEY, applyTheme, autoTheme } from '@/shared/config/theme';

export const ThemeClock = () => {
  useEffect(() => {
    const syncAuto = () => {
      if (localStorage.getItem(THEME_KEY)) return; // явний вибір — автоматика не втручається
      applyTheme(autoTheme());
    };
    const tick = setInterval(syncAuto, 60_000);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', syncAuto);
    return () => {
      clearInterval(tick);
      mql.removeEventListener('change', syncAuto);
    };
  }, []);

  return null;
};

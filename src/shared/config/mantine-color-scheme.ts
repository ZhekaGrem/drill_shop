// src/shared/config/mantine-color-scheme.ts
// Міст між нашою темою (data-theme) і темою Mantine (data-mantine-color-scheme).
//
// Навіщо він узагалі: обидві системи пишуть в один і той самий вузол
// <html>, але нічого не знали одна про одну. Інлайн-скрипт у layout.tsx ставив
// data-mantine-color-scheme='dark' до першого кадру, а MantineProvider на маунті
// (layout-ефект у use-provider-color-scheme) перезаписував його на 'light', бо
// його власний localStorage-менеджер бачив порожній ключ mantine-color-scheme-value
// і повертав defaultColorScheme. Атрибут data-theme при цьому лишався 'dark' —
// звідси чорний текст Mantine на графітових поверхнях.
//
// Тепер джерело правди одне: data-theme. Менеджер його читає, на нього
// підписується і в нього ж пише.
import type { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core';
import { applyTheme, type Theme } from './theme';

const isTheme = (value: string | null): value is Theme => value === 'dark' || value === 'light';

export const siteColorSchemeManager = (): MantineColorSchemeManager => {
  let observer: MutationObserver | undefined;

  return {
    get(defaultValue) {
      // Викликається і на сервері (useState-ініціалізатор), тому document
      // може не існувати.
      if (typeof document === 'undefined') return defaultValue;
      const current = document.documentElement.getAttribute('data-theme');
      return isTheme(current) ? current : defaultValue;
    },

    set(value: MantineColorScheme) {
      // 'auto' у нас не буває: і інлайн-скрипт, і ThemeClock розвʼязують
      // автоматику самі й записують уже конкретну тему.
      if (isTheme(value)) applyTheme(value);
    },

    subscribe(onUpdate) {
      if (typeof document === 'undefined') return;
      observer = new MutationObserver(() => {
        const next = document.documentElement.getAttribute('data-theme');
        if (isTheme(next)) onUpdate(next);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    },

    unsubscribe() {
      observer?.disconnect();
      observer = undefined;
    },

    clear() {
      // Явний вибір теми живе в localStorage під ключем THEME_KEY і
      // очищається дев-панеллю (/v2/dev), а не Mantine.
    },
  };
};

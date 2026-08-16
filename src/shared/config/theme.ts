// src/shared/config/theme.ts
// Єдиний контракт теми: ключ localStorage, авто-правило і застосування
// атрибутів. Ним користуються дев-панель /v2/dev і ThemeClock. Інлайн-скрипт
// у layout.tsx дублює правила дослівно (він рядок, імпорту не має) — міняєш
// тут — онови і його.
import { readDesignAttr } from './design';

export type Theme = 'dark' | 'light';
export type ThemeChoice = Theme | 'auto';

export const THEME_KEY = 'theme';

export const themeByClock = (): Theme => {
  const h = new Date().getHours();
  return h >= 18 || h < 6 ? 'dark' : 'light';
};

// «Авто» залежить від активної дизайн-концепції: стрітвір живе в темній,
// Cupertino слухає систему, Дія і мінімалізм — годинник 18:00–6:00
export const autoTheme = (): Theme => {
  const design = readDesignAttr();
  if (design === 'streetwear') return 'dark';
  if (design === 'cupertino') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return themeByClock();
};

export const applyTheme = (theme: Theme) => {
  const d = document.documentElement;
  d.setAttribute('data-theme', theme);
  d.setAttribute('data-mantine-color-scheme', theme);
};

// Явний вибір лежить у localStorage; його відсутність = «авто за годинником»
export const readThemeChoice = (): ThemeChoice => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' || saved === 'light' ? saved : 'auto';
};

export const setThemeChoice = (choice: ThemeChoice) => {
  if (choice === 'auto') {
    localStorage.removeItem(THEME_KEY);
    applyTheme(autoTheme());
  } else {
    localStorage.setItem(THEME_KEY, choice);
    applyTheme(choice);
  }
};

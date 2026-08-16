// src/shared/config/design.ts
// Дизайн-концепції (спеки в docs/superpowers/specs/2026-08-16-concept-*):
// перемикаються на дев-панелі /v2/dev через атрибут data-design на <html>
// (палітри — блоки [data-design='…'] у globals.css) і localStorage.design.
// 'diia' — чинний дизайн: без атрибута і без запису в сховищі.
// Інлайн-скрипт у layout.tsx ставить атрибут ДО першого кадру — дублює
// це правило дослівно; міняєш тут — онови і його.
export type DesignId = 'diia' | 'cupertino' | 'streetwear' | 'tactile';

export const DESIGN_KEY = 'design';
export const DESIGN_FALLBACK: DesignId = 'diia';

// Метадані для перемикача на дев-панелі
export const DESIGN_OPTIONS: { id: DesignId; label: string; hint: string }[] = [
  { id: 'diia', label: 'Дія', hint: 'чинний · стек героїв · тема за годинником' },
  { id: 'cupertino', label: 'Cupertino', hint: 'К1 · peek-карусель · системна тема · OLED-ніч' },
  { id: 'streetwear', label: 'Стрітвір', hint: 'К2 · плитки+сторіз · завжди темна · acid і стікери' },
  { id: 'tactile', label: 'Мінімалізм', hint: 'К3 · таби, одна сцена · смарагд/теракот · 18:00' },
];

const isDesignId = (v: string | null): v is DesignId =>
  v === 'diia' || v === 'cupertino' || v === 'streetwear' || v === 'tactile';

/** Що зараз на екрані (джерело правди — атрибут, його ставить пре-пейнт скрипт) */
export const readDesignAttr = (): DesignId => {
  const attr = document.documentElement.getAttribute('data-design');
  return isDesignId(attr) ? attr : DESIGN_FALLBACK;
};

export const applyDesign = (design: DesignId) => {
  const d = document.documentElement;
  if (design === DESIGN_FALLBACK) d.removeAttribute('data-design');
  else d.setAttribute('data-design', design);
};

export const setDesignChoice = (design: DesignId) => {
  if (design === DESIGN_FALLBACK) localStorage.removeItem(DESIGN_KEY);
  else localStorage.setItem(DESIGN_KEY, design);
  applyDesign(design);
};

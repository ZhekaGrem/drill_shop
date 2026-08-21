// src/shared/config/design.ts
//
// Імпорт лише типу назад із design-rotation не буває: там `import type`,
// який стирається при компіляції, тож циклу під час виконання нема.
// Дизайн-концепції (спеки в docs/superpowers/specs/2026-08-16-concept-*):
// перемикаються на дев-панелі /v2/dev через атрибут data-design на <html>
// (палітри — блоки [data-design='…'] у globals.css) і localStorage.design.
// 'diia' — чинний дизайн: без атрибута і без запису в сховищі.
// Інлайн-скрипт у layout.tsx ставить атрибут ДО першого кадру — дублює
// це правило дослівно; міняєш тут — онови і його.
import { ROTATION_ENABLED, designForTime } from './design-rotation';

export type DesignId =
  | 'diia'
  | 'cupertino'
  | 'streetwear'
  | 'tactile'
  // Кольористики 2026-08-20: чисті палітри, без власної механіки героя.
  // Обидві теми задані повністю, тож авто-тема лишається за годинником.
  | 'monolith'
  | 'overdrive'
  | 'spotlight';

export const DESIGN_KEY = 'design';
export const DESIGN_FALLBACK: DesignId = 'diia';

/** Палітри-кольористики (на відміну від концепцій, механіку не міняють) */
export const PALETTE_IDS: DesignId[] = ['monolith', 'overdrive', 'spotlight'];

// Метадані для перемикача на дев-панелі
export const DESIGN_OPTIONS: { id: DesignId; label: string; hint: string }[] = [
  { id: 'diia', label: 'Дія', hint: 'чинний · стек героїв · тема за годинником' },
  { id: 'monolith', label: 'Індустріальна студія', hint: 'В1 · бетон і сталь · електрик у ґрунті' },
  { id: 'overdrive', label: 'Аналоговий перегруз', hint: 'В2 · тепла крафтова база, мідь' },
  { id: 'spotlight', label: 'Сценічне світло', hint: 'В3 · радіальний софіт, фіолет-ціан' },
  { id: 'cupertino', label: 'Cupertino', hint: 'К1 · peek-карусель · системна тема · OLED-ніч' },
  { id: 'streetwear', label: 'Стрітвір', hint: 'К2 · плитки+сторіз · завжди темна · acid і стікери' },
  { id: 'tactile', label: 'Мінімалізм', hint: 'К3 · таби, одна сцена · смарагд/теракот · 18:00' },
];

/** Усі валідні id одним списком — його ж серіалізує інлайн-скрипт у layout */
export const DESIGN_IDS: DesignId[] = DESIGN_OPTIONS.map((o) => o.id);

const isDesignId = (v: string | null): v is DesignId => DESIGN_OPTIONS.some((o) => o.id === v);

/**
 * Вибір користувача, а не те, що на екрані. 'auto' означає «віддати рішення
 * календарю» (design-rotation.ts) — дзеркало ThemeChoice у theme.ts.
 */
export type DesignChoice = DesignId | 'auto';
export const DESIGN_CHOICE_AUTO = 'auto';

/**
 * Подія «вибір змінився». localStorage сам про запис не сповіщає (подія
 * `storage` летить лише в ІНШІ вкладки), а React мусить дізнатись про зміну
 * у своїй же. На неї підписаний useDesignChoice.
 *
 * Через атрибут data-design це не ловиться: коли календар уже показує Дію, а
 * її ж і закріплюють, applyDesign нічого не міняє — мутації нема, підписник
 * useDesign мовчить, і кнопка лишилась би ненатиснутою.
 */
export const DESIGN_CHOICE_EVENT = 'design-choice-change';

/** Що зараз на екрані (джерело правди — атрибут, його ставить пре-пейнт скрипт) */
export const readDesignAttr = (): DesignId => {
  const attr = document.documentElement.getAttribute('data-design');
  return isDesignId(attr) ? attr : DESIGN_FALLBACK;
};

/**
 * Явний вибір лежить у localStorage; його ВІДСУТНІСТЬ = 'auto' = ротація.
 *
 * Через це 'diia' тепер записується у сховище як усі інші. Раніше вона його
 * чистила (бо збігалась із фолбеком), і з появою ротації це стало пасткою:
 * «я натиснув Дію» і «я нічого не вибирав» лягли б в один стан, тож у день
 * Перегрузу дев-панель мовчки показувала б Перегруз замість обраної Дії.
 */
export const readDesignChoice = (): DesignChoice => {
  const saved = localStorage.getItem(DESIGN_KEY);
  return isDesignId(saved) ? saved : DESIGN_CHOICE_AUTO;
};

/** Вибір → конкретна палітра. Момент передається явно, щоб лишитись чистою. */
export const resolveDesign = (choice: DesignChoice, now: number): DesignId =>
  choice === DESIGN_CHOICE_AUTO ? (ROTATION_ENABLED ? designForTime(now) : DESIGN_FALLBACK) : choice;

export const applyDesign = (design: DesignId) => {
  const d = document.documentElement;
  const current = d.getAttribute('data-design');
  // Холостий запис — не безневинний: setAttribute з ТИМ САМИМ значенням усе
  // одно породжує mutation record, а на data-design підписаний спостерігач
  // useDesign. Той самий урок уже виписаний в applyTheme (theme.ts), де
  // холостий тік ThemeClock замикав Mantine в нескінченний microtask-цикл.
  // DesignClock тікає рідше, але пастка та сама.
  if (design === DESIGN_FALLBACK) {
    if (current !== null) d.removeAttribute('data-design');
  } else if (current !== design) {
    d.setAttribute('data-design', design);
  }
};

export const setDesignChoice = (choice: DesignChoice) => {
  if (choice === DESIGN_CHOICE_AUTO) localStorage.removeItem(DESIGN_KEY);
  else localStorage.setItem(DESIGN_KEY, choice);
  applyDesign(resolveDesign(choice, Date.now()));
  window.dispatchEvent(new Event(DESIGN_CHOICE_EVENT));
};

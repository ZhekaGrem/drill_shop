# Diia Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Повний рестайлінг магазину у дизайн-мову diia.gov.ua за спекою `docs/superpowers/specs/2026-08-08-diia-redesign-design.md`, включно з 15 UX-фіксами.

**Architecture:** Token-first каскад: спершу міняємо значення CSS-змінних у `globals.css` (їх використовує ~весь SCSS), шрифти та спільні компоненти (Button/Badge/mantine-theme), потім екранні проходи чистять локальні хардкоди й додають нові елементи (навігація, empty-стани, undo). Кожен таск лишає сайт робочим.

**Tech Stack:** Next.js 16 (App Router), Mantine 8.3, SCSS Modules, next/font/local, шрифт e-Ukraine (CC BY 4.0).

## Global Constraints

- Гілка: `v2`. Кожен таск завершується комітом. Pre-commit хук ганяє prettier+lint — він має пройти.
- Верифікація кожного таска: `npm run build` (успішна збірка, без TS-помилок) + `npm run lint` (0 errors). Якщо red — чинити до green, не комітити red.
- Токени (єдині значення, копіювати точно): фон `#ffffff`; секції `#E7EEF3`; текст `#000000`; другорядний `#606060`; кнопки primary `#000000`, hover `#333333`; лінки/фокус `#0073e6`; глибокий синій `#004BC1`; червоний ТІЛЬКИ для знижок/промо `#a63c48`; радіуси `8px/16px/32px`, pill `100px`; фокус глобально `outline: 3px solid #0073e6; outline-offset: 2px`; transition `0.2s ease-in-out`; letter-spacing кнопок/заголовків `-0.02em`.
- Шрифти: e-Ukraine 300/400/500 (body), e-UkraineHead (заголовки). Старі змінні `--font-condensed`, `--font-price`, `--font-mono` стають аліасами e-Ukraine (102 використання в SCSS — НЕ правити їх масово).
- Заборонено: `text-transform: uppercase` у нових стилях (крім лого), offset-тіні (`Npx Npx 0px`), `transform: translate(...)` на hover, нові хардкод-кольори поза токенами.
- FSD: залежності тільки вниз (`app → widgets → features → shared`); стилізація — один метод на елемент (Mantine props АБО SCSS-модуль АБО inline для динаміки).
- Скоуп: НЕ чіпати `/admin` і `/telegram` цілеспрямовано (спільні компоненти можна — але Button-варіанти `yellow/red/beige` НЕ видаляти з API, `/telegram` їх використовує; вони стають deprecated-аліасами).
- Тестів у проєкті нема; верифікація — build + lint + візуальний скріншот через dev-сервер (де вказано).

---

### Task 1: Шрифти e-Ukraine

**Files:**

- Create: `public/fonts/e-ukraine/` (woff-файли)
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Produces: CSS-змінні `--font-body`, `--font-heading` (e-Ukraine / e-UkraineHead) + аліаси `--font-condensed`, `--font-price`, `--font-mono` → усі вказують на e-Ukraine. Далі всі таски покладаються на ці змінні.

- [ ] **Step 1: Завантажити шрифти**

Офіційне джерело: https://thedigital.gov.ua/fonts (ліцензія CC BY 4.0 — комерційне використання дозволене з атрибуцією). Завантажити архіви **e-Ukraine** та **e-Ukraine Head** (Dropbox-лінки на сторінці; якщо curl не бере — завантажити вручну в браузері). Розпакувати; покласти в `public/fonts/e-ukraine/` файли (точні імена звірити з архівом, очікувані):

```
e-Ukraine-Light.woff    (300)
e-Ukraine-Regular.woff  (400)
e-Ukraine-Medium.woff   (500)
e-UkraineHead-Regular.woff
e-UkraineHead-Medium.woff  (якщо є в архіві)
```

Якщо в архіві є woff2 — брати woff2 (менша вага), інакше woff. Імена файлів у Step 2 підправити під фактичні.

- [ ] **Step 2: Переписати підключення шрифтів у layout.tsx**

Замінити в `src/app/layout.tsx` імпорт `next/font/google` і всі 5 констант шрифтів на:

```tsx
import localFont from 'next/font/local';

const eUkraine = localFont({
  src: [
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Light.woff', weight: '300', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Regular.woff', weight: '400', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Medium.woff', weight: '500', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

const eUkraineHead = localFont({
  src: [{ path: '../../public/fonts/e-ukraine/e-UkraineHead-Regular.woff', weight: '400', style: 'normal' }],
  variable: '--font-heading',
  display: 'swap',
});
```

У `<body className={...}>` лишити `${eUkraine.variable} ${eUkraineHead.variable}` і додати inline-аліаси старих змінних (102 SCSS-посилання продовжать працювати):

```tsx
<body
  className={`${eUkraine.variable} ${eUkraineHead.variable}`}
  style={
    {
      '--font-condensed': 'var(--font-body)',
      '--font-price': 'var(--font-body)',
      '--font-mono': 'var(--font-body)',
    } as React.CSSProperties
  }>
```

- [ ] **Step 3: Верифікація**

Run: `npm run build`
Expected: успішна збірка. Потім `npm run dev`, відкрити будь-яку сторінку — текст рендериться e-Ukraine (перевірити в DevTools computed font-family).

- [ ] **Step 4: Commit**

```bash
git add public/fonts src/app/layout.tsx
git commit -m "feat(v2): e-Ukraine fonts via next/font/local"
```

---

### Task 2: Токени й глобальна типографіка

**Files:**

- Modify: `src/app/globals.css` (блок `:root` рядки 235–326, типографіка 356–426, інпути 428–452, фокус 454–461, лінки 465–474, скролбар 476–498)
- Modify: `src/shared/config/design-tokens.ts` (повна заміна вмісту)

**Interfaces:**

- Produces: нові значення всіх `--*` токенів (див. Global Constraints) + нові токени `--accent-deep`, `--radius-pill`, `--error`. Всі наступні таски використовують ТІЛЬКИ ці токени.

- [ ] **Step 1: Замінити блок :root у globals.css**

Замінити рядки з `--background: #e0ddca;` до кінця `:root` на:

```css
:root {
  /* Фони */
  --background: #ffffff;
  --background-secondary: #e7eef3; /* фірмовий фон секцій Дії */
  --background-light: #f6f9fc;
  --background-dark: #000000;
  --foreground: #000000;

  /* Основні кольори */
  --primary: #000000; /* чорні pill-кнопки */
  --secondary: #ffffff;
  --accent: #0073e6; /* лінки/фокус */
  --accent-deep: #004bc1;
  --accent-red: #a63c48; /* ТІЛЬКИ знижки/промо */

  /* Статусні */
  --success: #28a745;
  --success-green: #16a34a;
  --warning: #d39e00;
  --info: #0073e6;
  --error: #a63c48;

  /* Текст */
  --text-primary: #000000;
  --text-secondary: #606060;
  --text-tertiary: #8a8a8a;
  --text-inverse: #ffffff;
  --text-white: #ffffff;

  /* Кнопки */
  --btn-primary: #000000;
  --btn-primary-hover: #333333;
  --btn-danger: #a63c48;

  /* Вага шрифту (Дія — легша) */
  --fw-light: 300;
  --fw-normal: 400;
  --fw-medium: 500;
  --fw-semibold: 500;
  --fw-bold: 500;
  --fw-black: 500;

  /* Розміри шрифту — без змін */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.75rem;
  --text-4xl: 2rem;
  --text-5xl: 2.25rem;
  --text-6xl: 2.5rem;

  /* Тіні — м'які */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.12);

  /* Border */
  --border-width: 2px; /* лише роздільники-акценти 2px solid #000 */
  --border-color: #000000;
  --border-subtle: #d6dde4; /* тонкі межі інпутів/карток */

  /* Радіуси */
  --border-radius-sm: 8px;
  --border-radius-md: 16px;
  --border-radius-lg: 32px;
  --radius-pill: 100px;

  /* Spacing — без змін */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-x: 40px;
  --spacing-y: 24px;
  --spacing-y-m: 12px;

  /* Transitions */
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.2s ease-in-out;
  --transition-slow: 0.3s ease-in-out;

  /* Layout — без змін */
  --container-max-width: 1200px;
  --container-wide: 1600px;
  --container-mobile: 320px;
}
```

Примітка: `--fw-bold/--fw-black → 500` — свідомо: e-Ukraine має максимум Medium 500; старі SCSS з `--fw-bold` автоматично отримають коректну вагу.

- [ ] **Step 2: Оновити типографіку h1–h6 у globals.css**

Замінити блок `/* === ТИПОГРАФІКА === */`:

```css
h1,
h2,
h3,
h4 {
  font-family: var(--font-heading);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
h1 {
  font-size: var(--text-5xl);
}
h2 {
  font-size: var(--text-4xl);
}
h3 {
  font-size: var(--text-3xl);
}
h4 {
  font-size: var(--text-2xl);
}
h5,
h6 {
  font-family: var(--font-body);
  font-weight: var(--fw-medium);
  line-height: 1.2;
  color: var(--text-primary);
}
h5 {
  font-size: var(--text-xl);
}
h6 {
  font-size: var(--text-lg);
}
```

У медіа-блоці `@media (max-width: 768px)` замінити розміри: h1 → `var(--text-3xl)`, h2 → `var(--text-2xl)`, h3 → `var(--text-xl)`, h4 → `var(--text-lg)`.

- [ ] **Step 3: Інпути, фокус, лінки, скролбар, selection**

У `globals.css` замінити відповідні блоки:

```css
/* Інпути (база; деталі — mantine-theme) */
input,
textarea,
select {
  font-family: var(--font-body);
  font-size: var(--text-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background: var(--background);
  color: var(--text-primary);
  transition: var(--transition-fast);
}
input::placeholder,
textarea::placeholder {
  color: var(--text-secondary);
  font-weight: var(--fw-light);
  opacity: 1;
}
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
}

/* Фокус — фірмовий синій Дії */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

/* Лінки */
a {
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition-fast);
}
a:hover {
  color: var(--accent);
}

/* Скролбар — нейтральний */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--background-secondary);
}
::-webkit-scrollbar-thumb {
  background: #b9c4cf;
  border-radius: var(--radius-pill);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

::selection {
  background: var(--background-secondary);
  color: var(--text-primary);
}
```

Також: у `.btn-text` (рядок ~563) замінити вміст на `font-family: var(--font-body); font-weight: 500; font-size: 18px; line-height: 1.2; letter-spacing: -0.02em;` (без uppercase). Блок `.mantine-Checkbox-*` (рядки ~572–608) ВИДАЛИТИ — Task 3 переносить чекбокси в mantine-theme.

- [ ] **Step 4: Синхронізувати design-tokens.ts**

Повний новий вміст `src/shared/config/design-tokens.ts`:

```ts
// Дзеркало ключових CSS-змінних із globals.css для TS-коду.
// Джерело правди — globals.css :root. Міняєш там — міняй тут.
export const tokens = {
  primary: '#000000',
  secondary: '#ffffff',
  accent: '#0073e6',
  accentDeep: '#004BC1',
  accentRed: '#a63c48', // тільки знижки/промо

  textPrimary: '#000000',
  textSecondary: '#606060',
  textInverse: '#ffffff',

  background: '#ffffff',
  backgroundSecondary: '#E7EEF3',

  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};
```

- [ ] **Step 5: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev-сервер: сайт став білим з чорним текстом (місцями лишаються старі хардкоди — це нормально, їх чистять Tasks 4–9).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/shared/config/design-tokens.ts
git commit -m "feat(v2): Diia design tokens + global typography"
```

---

### Task 3: Button, Badge, mantine-theme

**Files:**

- Modify: `src/shared/components/Button/button.module.scss` (повна заміна)
- Modify: `src/shared/components/Badge/Badge.module.scss` (повна заміна)
- Modify: `src/shared/config/mantine-theme.ts` (повна заміна)
- Create: `public/svg/checkmark-white.svg`

**Interfaces:**

- Consumes: токени Task 2.
- Produces: Button API незмінний (`variant: primary|secondary|yellow|red|beige|outline|ghost`, `size: sm|md|lg|xl|menu|fl|promo`) — `yellow/red/beige` тепер deprecated-аліаси. Badge API незмінний (`type: promo|featured|discount|new|outOfStock`).

- [ ] **Step 1: Новий button.module.scss**

Повна заміна вмісту:

```scss
// Diia-style buttons: pill, чорний primary, спокійні переходи
.button {
  font-family: var(--font-body);
  font-weight: var(--fw-medium);
  font-size: var(--text-base);
  line-height: 1.5;
  letter-spacing: -0.02em;
  transition: var(--transition-normal);
  border-radius: var(--radius-pill);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;

  &--primary {
    background: var(--btn-primary);
    color: var(--text-inverse);

    &:hover:not(:disabled) {
      background: var(--btn-primary-hover);
    }
  }

  &--secondary {
    background: var(--background);
    color: var(--text-primary);
    border: 1px solid var(--text-primary);

    &:hover:not(:disabled) {
      background: var(--background-secondary);
    }
  }

  &--outline {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);

    &:hover:not(:disabled) {
      border-color: var(--text-primary);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-primary);

    &:hover:not(:disabled) {
      color: var(--accent);
      background: transparent;
    }
  }

  // DEPRECATED аліаси (використовує /telegram та старі екрани до їх проходу).
  // Не видаляти до окремого рішення по /telegram.
  &--yellow {
    background: var(--btn-primary);
    color: var(--text-inverse);

    &:hover:not(:disabled) {
      background: var(--btn-primary-hover);
    }
  }

  &--red {
    background: transparent;
    color: var(--btn-danger);

    &:hover:not(:disabled) {
      background: var(--background-secondary);
    }
  }

  &--beige {
    background: var(--background);
    color: var(--text-primary);
    border: 1px solid var(--text-primary);

    &:hover:not(:disabled) {
      background: var(--background-secondary);
    }
  }

  // Sizes (висоти збережені — верстка не стрибає)
  &--sm {
    padding: 10px 20px;
    font-size: var(--text-sm);
    height: 40px;
  }
  &--md {
    padding: 12px 24px;
    font-size: var(--text-base);
    height: 48px;
  }
  &--lg {
    padding: 16px 32px;
    font-size: var(--text-base);
    height: 56px;
  }
  &--xl {
    padding: 16px 40px;
    font-size: var(--text-lg);
    height: 60px;
  }
  &--promo {
    padding: 8px 16px;
    font-size: var(--text-sm);
    height: 36px;
  }
  &--fl {
    padding: 0;
    min-width: 0;
  }
  &--menu {
    padding: 12px 24px;
    font-size: var(--text-base);
    height: 48px;
    width: 100%;
    justify-content: flex-start;
    border-radius: var(--border-radius-sm);
  }

  &--fullWidth {
    width: 100%;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
```

- [ ] **Step 2: Новий Badge.module.scss**

Повна заміна вмісту (стрічки-трикутники зникають):

```scss
// Diia-style badges: pill, мінімум кольору
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: var(--fw-medium);
  font-size: 12px;
  line-height: 1;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-pill);

  &.badgePromo,
  &.badgeDiscount {
    background-color: var(--accent-red);
    color: var(--text-white);
  }

  &.badgeFeatured {
    background-color: var(--text-primary);
    color: var(--text-inverse);
  }

  &.badgeNew {
    background-color: var(--background-secondary);
    color: var(--text-primary);
  }

  &.badgeOutOfStock {
    background-color: var(--text-secondary);
    color: var(--text-white);
  }
}

@media (max-width: 768px) {
  .badge {
    height: 22px;
    font-size: 11px;
  }
}
```

- [ ] **Step 3: Біла галочка чекбокса**

Створити `public/svg/checkmark-white.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10" fill="none"><path d="M1 5.5L4.5 9L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

- [ ] **Step 4: Новий mantine-theme.ts**

Повна заміна вмісту:

```ts
// src/shared/config/mantine-theme.ts
// Diia-style: білі поля, radius 8, синій фокус, чорні контроли
import { createTheme, Input } from '@mantine/core';

const inputStyles = {
  input: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-primary)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    transition: 'var(--transition-fast)',
    '&:focus': {
      borderColor: 'var(--accent)',
    },
    '&::placeholder': {
      color: 'var(--text-secondary)',
      fontWeight: 300,
      opacity: 1,
    },
  },
  label: {
    color: 'var(--text-primary)',
    fontWeight: 400,
    marginBottom: '4px',
  },
};

export const mantineTheme = createTheme({
  primaryColor: 'dark',
  fontFamily: 'var(--font-body)',
  fontFamilyMonospace: 'var(--font-body)',
  headings: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '400',
  },
  defaultRadius: 'md',
  components: {
    InputWrapper: Input.Wrapper.extend({
      styles: {
        error: { color: 'var(--error)', fontWeight: '500' },
      },
    }),
    Anchor: {
      styles: {
        root: { '&:hover': { color: 'var(--accent)' } },
      },
    },
    TextInput: { styles: inputStyles },
    PasswordInput: {
      styles: {
        ...inputStyles,
        innerInput: { backgroundColor: 'transparent' },
      },
    },
    Textarea: { styles: inputStyles },
    Select: {
      styles: {
        input: inputStyles.input,
        label: inputStyles.label,
        dropdown: {
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--border-radius-sm)',
          boxShadow: 'var(--shadow-md)',
        },
        option: {
          padding: 'var(--spacing-sm) var(--spacing-md)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-sm)',
          '&:hover': { backgroundColor: 'var(--background-secondary)' },
          '&[dataSelected]': { backgroundColor: 'var(--background-secondary)' },
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--border-radius-md)',
        },
      },
    },
    Alert: {
      styles: () => ({
        root: {
          borderRadius: 'var(--border-radius-md)',
          borderTop: '2px solid var(--text-primary)',
        },
        message: { color: 'var(--text-primary)', fontWeight: '400' },
      }),
    },
    Notification: {
      styles: () => ({
        root: {
          border: 'none',
          borderTop: '2px solid var(--text-primary)',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--background)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
        },
        title: { fontSize: 'var(--text-base)', fontWeight: '500' },
        description: { fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' },
        closeButton: {
          color: 'var(--text-secondary)',
          '&:hover': { background: 'var(--background-secondary)' },
        },
      }),
    },
    Modal: {
      styles: {
        content: { borderRadius: 'var(--border-radius-md)' },
        header: { borderBottom: '2px solid var(--text-primary)' },
      },
    },
    Checkbox: {
      styles: {
        input: {
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: 'var(--text-primary)',
            borderColor: 'var(--text-primary)',
            backgroundImage: "url('/svg/checkmark-white.svg')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '12px',
          },
          '&:disabled': {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
        },
        icon: { display: 'none' },
      },
    },
    Radio: {
      styles: {
        radio: {
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          '&:checked': {
            backgroundColor: 'var(--text-primary)',
            borderColor: 'var(--text-primary)',
          },
        },
      },
    },
  },
  focusRing: 'auto',
  cursorType: 'pointer',
});
```

- [ ] **Step 5: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev: усі кнопки стали pill (чорні/білі), інпути білі з сірим бордером, бейджі pill.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/Button src/shared/components/Badge src/shared/config/mantine-theme.ts public/svg/checkmark-white.svg
git commit -m "feat(v2): Diia-style Button, Badge, Mantine theme"
```

---

### Task 4: Header + Footer

**Files:**

- Modify: `src/widgets/Header/Header.tsx` (навігація, дедуплікація leftSection, лічильник, підказки пошуку)
- Modify: `src/widgets/Header/header.module.scss`
- Modify: `src/widgets/Footer/Footer.tsx` (лінк /contact, privacy-policy, атрибуція шрифту)
- Modify: `src/widgets/Footer/footer.module.scss`

**Interfaces:**

- Consumes: токени, Button/Badge з Tasks 2–3; `useCategoriesStore` з `@/shared/stores/categories` (вже існує).
- Produces: localStorage-ключ `recent-searches` (JSON string[], max 5) — використовується тільки тут.

- [ ] **Step 1: Прочитати поточні Header.tsx + header.module.scss повністю**

Перед правками прочитати обидва файли цілком (269 + 409 рядків) — правки нижче точкові, решту стилів адаптувати до токенів за Global Constraints.

- [ ] **Step 2: Header.tsx — навігація і чистка**

1. Видалити дубльований блок `leftSection` (рядки ~216–227, `mobileOnly` копія ідентична `desktopOnly` — лишити ОДИН блок без класів desktop/mobile).
2. Додати desktop-навігацію після лого (фікс №3):

```tsx
const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Розпродаж', href: '/catalog?promo=true' },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

// у JSX після <Link href="/">…лого…</Link>:
<nav className={styles.desktopNav} aria-label="Основна навігація">
  {NAV_ITEMS.map((item) => (
    <Link key={item.href} href={item.href} className={styles.navLink}>
      {item.label}
    </Link>
  ))}
</nav>;
```

3. У `MobileMenu` замінити `menuItems` на той самий `NAV_ITEMS` (винести константу вище обох компонентів) — єдиний регістр (фікс №13).
4. Лічильник кошика: видалити `<span className={styles.desktopOnly}>{calculations?.itemsCount || 0}</span>` (фікс №11) — лишити тільки Badge.
5. Пошук-підказки (фікс №7): додати стан і дропдаун у блок expandedSearch:

```tsx
const RECENT_KEY = 'recent-searches';
const [recentSearches, setRecentSearches] = useState<string[]>([]);

useEffect(() => {
  try {
    setRecentSearches(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
  } catch {
    setRecentSearches([]);
  }
}, [isSearchExpanded]);

const saveRecent = (q: string) => {
  const next = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
};
```

У `handleSearch` перед редіректом викликати `saveRecent(searchQuery.trim())`. Під інпутом (усередині `expandedSearchContainer`) рендерити:

```tsx
{
  recentSearches.length > 0 && !searchQuery && (
    <div className={styles.searchSuggestions}>
      <span className={styles.suggestionsLabel}>Останні запити</span>
      {recentSearches.map((q) => (
        <button
          key={q}
          type="button"
          className={styles.suggestionItem}
          onMouseDown={() => {
            saveRecent(q);
            window.location.href = `/catalog?search=${encodeURIComponent(q)}`;
          }}>
          {q}
        </button>
      ))}
    </div>
  );
}
```

(`onMouseDown`, не `onClick` — щоб спрацювати до `onBlur` інпута.)

- [ ] **Step 3: header.module.scss — Diia-стилі**

Ключові правки (решта — заміна старих кольорів на токени):

```scss
.wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  border-bottom: 1px solid var(--border-subtle);
}

.desktopNav {
  display: none;
  gap: var(--spacing-lg);
  @media (min-width: 1024px) {
    display: flex;
  }
}

.navLink {
  font-size: var(--text-base);
  color: var(--text-primary);
  padding: var(--spacing-sm) 0;
  &:hover {
    color: var(--accent);
  }
}

.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  background: transparent;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-primary);
  &:hover {
    background: var(--background-secondary);
  }
}

.searchSuggestions {
  display: flex;
  flex-direction: column;
  background: var(--background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}
.suggestionsLabel {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
}
.suggestionItem {
  text-align: left;
  border: none;
  background: transparent;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--text-base);
  &:hover {
    background: var(--background-secondary);
  }
}
```

Плюс: `.expandedSearchInput` — pill (`border-radius: var(--radius-pill); border: 1px solid var(--border-subtle); background: #fff;`); ВИДАЛИТИ всі `background: var(--accent-red)` на hover іконок і всі `transform: translate(...)`; `.cartButton` — як `.iconButton`.

- [ ] **Step 4: Footer.tsx — лінки і атрибуція**

1. `<Link href="/about">Зв'язок з нами</Link>` → `<Link href="/contact">Зв'язок з нами</Link>` (фікс №9).
2. У колонку «Про нас» додати `<Link href="/privacy-policy">Політика конфіденційності</Link>`.
3. У bottom section додати атрибуцію (вимога CC BY 4.0):

```tsx
<div className={styles.designerSection}>
  <span>Шрифт</span>
  <a href="https://thedigital.gov.ua/fonts" target="_blank" rel="noopener noreferrer">
    <span>e-Ukraine © Мінцифра, CC BY 4.0</span>
  </a>
</div>
```

- [ ] **Step 5: footer.module.scss — Diia-стилі**

`.footer` → `background: var(--background-secondary); border-top: 2px solid var(--text-primary);` (фірмова чорна лінія). Всі старі кольори (бежевий/зелений) замінити токенами; лінки колонок: `color: var(--text-primary); font-weight: var(--fw-light);` hover → `var(--accent)`.

- [ ] **Step 6: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev: хедер білий sticky з навігацією на ≥1024px; пошук з підказками після 1-2 запитів; футер на #E7EEF3 з чорною лінією; «Зв'язок з нами» веде на /contact.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/Header src/widgets/Footer
git commit -m "feat(v2): Diia header with nav + search suggestions, footer fixes"
```

---

### Task 5: Каталог + ProductCard

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCard.module.scss`
- Modify: `src/features/catalog/components/ProductCard/ProductCardInfo.tsx` (radio, назва без підміни)
- Modify: `src/features/catalog/components/ProductCard/ProductCardImage.tsx` (видалити glitch-клас і закоментований Favorites)
- Modify: `src/app/catalog/CatalogClient.tsx` (empty/end стани)
- Modify: `src/app/catalog/catalog.module.scss`, `src/features/catalog/components/CatalogFilters/CatalogFilters.module.scss`, `src/features/catalog/components/TopFilters/TopFilters.module.scss`, `src/features/catalog/components/MobileFilterModal/MobileFilterModal.module.scss` (токен-чистка)

**Interfaces:**

- Consumes: токени, Badge, Button.
- Produces: `useCatalogFilters` має існуючий метод скидання — перевірити ім'я в `src/features/catalog/hooks/useCatalogFilters.ts` (очікується `resetFilters` або аналог) і використати його в empty-стані.

- [ ] **Step 1: ProductCardInfo.tsx — назва і radio-чипи**

1. Рядок 72–74: `{isImageHovered && product.shortDescription ? product.shortDescription : product.name}` → `{product.name}` (фікс №5).
2. Обидва `<input type="checkbox" ...>` (main-варіант і map варіантів) → `type="radio"` з `name={'variant-' + product.id}` (фікс №6); решта пропсів без змін.

- [ ] **Step 2: ProductCardImage.tsx — чистка**

Видалити: клас `styles.glitching` з className (лишити базовий wrapper), закоментований блок FavoriteButton (рядки ~55–62) та його імпорт (фікс №15).

- [ ] **Step 3: ProductCard.module.scss — Diia-картка**

Прочитати файл повністю (497 рядків). Ключові заміни:

```scss
.card {
  background: var(--background);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-xs);
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.title {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--fw-normal);
  line-height: 1.4;
}

.price,
.finalPrice {
  font-size: var(--text-xl);
  font-weight: var(--fw-medium);
}
.finalPrice {
  color: var(--accent-red);
}
.originalPrice {
  color: var(--text-secondary);
  font-weight: var(--fw-light);
  text-decoration: line-through;
}

.variantCheckboxText {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px; /* фікс №1: тап-таргет */
  min-width: 44px;
  padding: 4px 12px;
  font-size: var(--text-sm);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  transition: var(--transition-fast);
}
.variantCheckbox input:checked + .variantCheckboxText {
  background: var(--text-primary);
  color: var(--text-inverse);
  border-color: var(--text-primary);
}
```

ВИДАЛИТИ: `@keyframes`/класи glitch-анімації, всі offset-тіні, `text-transform: uppercase`. У мобільному медіа-блоці (рядки ~376–380): `.variantCheckboxText { min-height: 32px; min-width: 36px; font-size: 12px; padding: 3px 8px; }` — НЕ менше.

- [ ] **Step 4: CatalogClient.tsx — стани списку**

1. «Всі товари завантажено» (рядки ~153–159): `c="red"` → `c="dimmed"` (фікс №4a).
2. Порожній результат (рядки ~164–170) замінити на (фікс №4b):

```tsx
{
  !isLoading && !error && products.length === 0 && (
    <Center py="xl">
      <Stack align="center" gap="md" maw={400}>
        <IconFilter size={64} color="var(--mantine-color-gray-5)" />
        <Title order={3} ta="center">
          Нічого не знайдено
        </Title>
        <Text ta="center" c="dimmed">
          За обраними фільтрами товарів немає. Спробуйте змінити або скинути фільтри.
        </Text>
        <Button variant="secondary" onClick={handleResetFilters}>
          Скинути фільтри
        </Button>
      </Stack>
    </Center>
  );
}
```

`handleResetFilters`: викликати метод скидання з `useCatalogFilters()` (звірити точне ім'я в хуку; якщо методу нема — редірект `window.location.href = '/catalog'`). Додати імпорти `Title`, `Stack` з `@mantine/core`.

- [ ] **Step 5: Токен-чистка SCSS каталогу**

Run: `grep -nE '#33603b|#e0ddca|#e6db1b|#2b2b27|#a63c48|uppercase' src/app/catalog/catalog.module.scss src/features/catalog/components/CatalogFilters/CatalogFilters.module.scss src/features/catalog/components/TopFilters/TopFilters.module.scss src/features/catalog/components/MobileFilterModal/MobileFilterModal.module.scss src/features/catalog/components/SearchInput/SearchInput.module.scss src/features/catalog/components/ProductQuickViewModal/ProductQuickViewModal.module.scss`

Кожен збіг замінити: зелений/бежевий/жовтий фони → `var(--background)` або `var(--background-secondary)`; текст → `var(--text-primary)`/`var(--text-secondary)`; `#a63c48` поза знижками → `var(--accent)` (hover) або прибрати; `uppercase` — видалити. Фільтри-чипи → pill (`border-radius: var(--radius-pill)`).

- [ ] **Step 6: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev `/catalog`: білі картки з тінню на hover, radio-чипи розмірів ≥32px, порожній пошук (`/catalog?search=zzzzz`) показує empty-стан з кнопкою.

- [ ] **Step 7: Commit**

```bash
git add src/features/catalog src/app/catalog
git commit -m "feat(v2): Diia catalog + product cards, radio chips, empty states"
```

---

### Task 6: Сторінка товару

**Files:**

- Modify: `src/shared/styles/productDetails.module.scss` (головний файл стилів сторінки, 17 font-посилань)
- Modify: `src/app/catalog/[slug]/productDetails.module.scss`
- Modify: `src/features/catalog/components/ProductInfo/ProductActions.tsx` (size-guide кнопка)
- Modify: `src/features/catalog/components/ProductInfo/PriceDisplay.tsx` (інлайн-кольори → токени)
- Modify: `src/features/catalog/components/ProductInfo/VariantSelector.tsx` (стилі чипів — той самий патерн, що Task 5 Step 3)

**Interfaces:**

- Consumes: токени, Button, патерн pill-чипів з Task 5.

- [ ] **Step 1: ProductActions.tsx — size-guide (фікс №10)**

Замінити кнопку з `<Image src="/assets/img/btnInfo.jpg" .../>` на:

```tsx
{
  hasSizeGuide && (
    <Button
      variant="outline"
      onClick={onOpenSizeGuide}
      className={styles.sizeGuideButton}
      aria-label="Таблиця розмірів">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 8h18M3 8v8a1 1 0 001 1h16a1 1 0 001-1V8M3 8l2-4h14l2 4M7 8v3M11 8v5M15 8v3M19 8v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      Розміри
    </Button>
  );
}
```

Видалити імпорт `next/image` з файлу, якщо більше не використовується. У `productDetails.module.scss` додати:

```scss
.sizeGuideButton {
  height: 48px; /* = висота quantitySelector — спільна вісь ряду */
}
.actionButtonsWrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.quantitySelector {
  height: 48px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}
```

- [ ] **Step 2: PriceDisplay.tsx — токени замість інлайну**

В обох місцях видалити `style={{ textDecoration: 'line-through', color: '#999' }}` — перенести в клас `.productDetails__originalPrice` у `productDetails.module.scss`:

```scss
.productDetails__originalPrice {
  text-decoration: line-through;
  color: var(--text-secondary);
  font-weight: var(--fw-light);
}
.productDetails__currentPrice {
  font-size: var(--text-3xl);
  font-weight: var(--fw-medium);
  &_discount {
    color: var(--accent-red);
  }
}
```

- [ ] **Step 3: Токен-чистка обох productDetails.module.scss**

Прочитати `src/shared/styles/productDetails.module.scss` повністю. Грепнути ті самі патерни, що в Task 5 Step 5, по обох файлах. Замінити за тими самими правилами. Кнопки «КУПИТИ ЗАРАЗ»/«В кошик» вже стилізуються через Button (Task 3) — локальні перевизначення фону/кольору в scss видалити, лишити тільки розміри/розташування. `text-transform: uppercase` видалити («КУПИТИ ЗАРАЗ» у JSX перейменувати на «Купити зараз» — файл `ProductActions.tsx`).

- [ ] **Step 4: VariantSelector.tsx — pill-чипи**

Звірити класи з `productDetails.module.scss`; застосувати той самий блок стилів чипів, що в Task 5 Step 3 (min-height 32px, pill, чорна заливка checked). Якщо селектор використовує `input type="checkbox"` із single-select логікою — замінити на `type="radio"` з `name="product-variant"` (як у Task 5 Step 1).

- [ ] **Step 5: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev: відкрити будь-який товар — ряд «кількість + Розміри» на одній осі однієї висоти, ціни за токенами, чипи pill.

- [ ] **Step 6: Commit**

```bash
git add src/shared/styles src/app/catalog/[slug] src/features/catalog/components/ProductInfo
git commit -m "feat(v2): Diia product page, aligned action row, SVG size guide"
```

---

### Task 7: Кошик + Чекаут + Success/Failed

**Files:**

- Modify: `src/features/cart/components/CartItem/CartItem.tsx` (undo)
- Modify: `src/features/cart/components/CartItem/CartItem.module.scss`
- Modify: `src/app/cart/Cart.tsx` (чистка закоментованого)
- Modify: `src/app/cart/Cart.module.scss`
- Modify: `src/features/cart/components/CartDrawer/CartDrawer.tsx` (чистка закоментованого)
- Modify: `src/features/checkout/components/CheckoutForm/CheckoutForm.tsx` (примітка без alert-іконки)
- Modify: `src/features/checkout/components/CheckoutForm/CheckoutForm.module.scss` + `DeliveryMethod.module.scss` + `PromoCodeInput.module.scss` + `CheckoutCard.module.scss` (токен-чистка)
- Modify: `src/app/checkout/success/CheckoutSuccess.tsx` (без UUID)
- Modify: `src/app/checkout/checkout.module.scss`

**Interfaces:**

- Consumes: токени, Button, Mantine Notification (стилізована в Task 3); `useCart()` з `@/features/cart/hooks/useCart` — методи `removeItem`, `addItem` (звірити сигнатуру `addItem` у хуку перед Step 1).

- [ ] **Step 1: CartItem.tsx — undo видалення (фікс №8)**

Використати `@mantine/notifications` (вже в проєкті — звірити імпорт у `src/shared/utils/notifications.tsx`). Замінити `handleRemove`:

```tsx
import { notifications } from '@mantine/notifications';

const handleRemove = useCallback(() => {
  const snapshot = {
    productId: item.product.id,
    variantId: item.variant?.id,
    quantity: item.quantity,
  };
  removeItem(item.id);
  notifications.show({
    id: `undo-${item.id}`,
    title: 'Товар видалено',
    message: (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          addItem(snapshot.productId, snapshot.quantity, snapshot.variantId);
          notifications.hide(`undo-${item.id}`);
        }}>
        Повернути
      </Button>
    ),
    autoClose: 5000,
  });
}, [item, removeItem, addItem]);
```

`addItem` взяти з `useCart()`; якщо сигнатура інша (напр. приймає обʼєкт) — адаптувати виклик під фактичну, snapshot має нести ті ж поля.

- [ ] **Step 2: Cart.tsx + CartDrawer.tsx — чистка (фікс №15)**

Видалити закоментовані блоки: Cart.tsx рядки ~49–56 (лічильник + «Очистити»), CartDrawer.tsx рядки ~64–75. Видалити з деструктуризації `clearCart, isClearingCart`, якщо більше не використовуються.

- [ ] **Step 3: CheckoutForm.tsx — примітка (фікс №14)**

У блоці `agreementNotice` (рядки ~173–186) видалити `<IconAlertCircle size={20} />` — лишити тільки текст. Якщо `IconAlertCircle` ще потрібен для Alert-ів вище — імпорт лишити.

- [ ] **Step 4: CheckoutSuccess.tsx — без UUID (фікс №12)**

Видалити `<Group>` з «ID замовлення» (рядки ~60–67). `orderId` лишити в параметрах (використовується для guard) — просто не рендерити.

- [ ] **Step 5: Документ-підсумок і токен-чистка SCSS**

У `Cart.module.scss` — підсумок як «документ» Дії:

```scss
.summary {
  background: var(--background);
  border-radius: var(--border-radius-md);
  border-top: 2px solid var(--text-primary);
  box-shadow: var(--shadow-sm);
}
```

Той самий патерн для `OrderSummary`-обгортки в `CheckoutForm.module.scss` (знайти клас summary-колонки). Фон сторінки чекаута: `.checkoutForm`/`formGrid`-обгортка → секції в білих картках на `var(--background-secondary)`. Грепнути патерни Task 5 Step 5 по всіх SCSS цього таска й замінити за тими самими правилами. Зелену вертикальну лінію `.divider` у Cart.module.scss → `background: var(--border-subtle); width: 1px;`.

- [ ] **Step 6: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev: додати товар у кошик → видалити → тост «Повернути» повертає товар протягом 5с; чекаут — білі секції на блакитному тлі; success без UUID.

- [ ] **Step 7: Commit**

```bash
git add src/features/cart src/features/checkout src/app/cart src/app/checkout
git commit -m "feat(v2): Diia cart/checkout, undo remove, cleanup"
```

---

### Task 8: Головна сторінка

**Files:**

- Modify: `src/app/Home.tsx` (нова структура секцій)
- Modify: `src/app/home.module.scss` (повна заміна)
- Modify: `src/app/LayoutWrapper.tsx` (прибрати виняток для `/`)
- Read before: `src/widgets/PopularProductsSlider/PopularProductsSlider.tsx`, `src/shared/stores/categories.ts` (сигнатури для секції категорій)

**Interfaces:**

- Consumes: Header/Footer (Task 4), ProductCard (Task 5), `useCategoriesStore` (звірити селектор списку категорій у файлі перед використанням).

- [ ] **Step 1: LayoutWrapper.tsx — хедер на головній (фікс №2)**

Видалити `isHomePage` і його гілку — лишити тільки виняток для `/telegram`:

```tsx
const isTelegramPage = pathname?.startsWith('/telegram');
if (isTelegramPage) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Home.tsx — нова структура**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Suspense, lazy, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { PopularProductsSlider } from '@/widgets/PopularProductsSlider/PopularProductsSlider';
import { useCategoriesStore } from '@/shared/stores/categories';
import styles from './home.module.scss';

const Spline = lazy(() => import('@splinetool/react-spline'));

const ADVANTAGES = [
  { title: 'Доставка 1-2 дні', text: 'Нова пошта по всій Україні' },
  { title: 'Оплата при отриманні', text: 'Або онлайн — як зручно' },
  { title: 'Обмін і повернення', text: '14 днів без питань' },
];

const Home = () => {
  const router = useRouter();
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const categories = useCategoriesStore((s) => s.categories); // звірити селектор зі стором

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Офіційний мерч shchilnui Drill</h1>
          <p className={styles.heroSubtitle}>Футболки, худі та аксесуари з дропів гурту</p>
          <Button size="lg" variant="primary" onClick={() => router.push('/catalog')}>
            До каталогу <ArrowRight />
          </Button>
        </div>
        <div className={styles.heroVisual}>
          {!isSplineLoaded && (
            <Image
              src="/assets/img/tshirt.webp"
              alt="Футболка Drill shop — офіційний мерч"
              width={520}
              height={520}
              className={styles.placeholderImage}
              priority
            />
          )}
          <div style={{ opacity: isSplineLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <Suspense fallback={null}>
              <Spline
                scene="https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode"
                onLoad={() => setIsSplineLoaded(true)}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Категорії */}
      {categories && categories.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Категорії</h2>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat.id} href={`/catalog/category/${cat.slug}`} className={styles.categoryCard}>
                <span className={styles.categoryName}>{cat.name}</span>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Популярне */}
      <section className={styles.section}>
        <PopularProductsSlider />
      </section>

      {/* Переваги */}
      <section className={styles.section}>
        <div className={styles.advantages}>
          {ADVANTAGES.map((a) => (
            <div key={a.title} className={styles.advantageCard}>
              <span className={styles.advantageTitle}>{a.title}</span>
              <span className={styles.advantageText}>{a.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
```

Перед написанням звірити: пропси `PopularProductsSlider` (може вимагати products), поля категорії (`id/slug/name`) у сторі. Якщо стор порожній на головній (не ініціалізується) — використати `CategoriesInitializer` з `shared/components` (вже існує) або прибрати секцію категорій і зафіксувати це в коміт-месиджі.

- [ ] **Step 3: home.module.scss — повна заміна**

```scss
.page {
  background: var(--background);
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
  background: var(--background-secondary);
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-lg) var(--spacing-x);
  padding: var(--spacing-2xl) var(--spacing-xl);
  min-height: 520px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
    min-height: auto;
  }
}

.heroText {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 480px;
}

.heroTitle {
  font-family: var(--font-heading);
  font-size: var(--text-6xl);
  line-height: 1.15;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: var(--text-4xl);
  }
}

.heroSubtitle {
  font-size: var(--text-lg);
  font-weight: var(--fw-light);
  color: var(--text-secondary);
}

.heroVisual {
  position: relative;
  width: 520px;
  height: 520px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 320px;
    height: 320px;
  }
}

.placeholderImage {
  position: absolute;
  inset: 0;
  object-fit: contain;
}

.section {
  margin: var(--spacing-2xl) var(--spacing-x);

  @media (max-width: 768px) {
    margin: var(--spacing-xl) var(--spacing-md);
  }
}

.sectionTitle {
  margin-bottom: var(--spacing-lg);
}

.categoryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.categoryCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--background);
  border: 1px solid var(--border-subtle);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  transition: var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    color: var(--text-primary);
  }
}

.categoryName {
  font-size: var(--text-lg);
  font-weight: var(--fw-medium);
}

.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
}

.advantageCard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  background: var(--background-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.advantageTitle {
  font-weight: var(--fw-medium);
}

.advantageText {
  font-size: var(--text-sm);
  font-weight: var(--fw-light);
  color: var(--text-secondary);
}
```

- [ ] **Step 4: Верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev `/`: хедер і футер присутні, hero на блакитному з 3D праворуч, секції категорій/популярного/переваг. Кошик доступний з головної.

- [ ] **Step 5: Commit**

```bash
git add src/app/Home.tsx src/app/home.module.scss src/app/LayoutWrapper.tsx
git commit -m "feat(v2): Diia home page with header, hero, category and advantage sections"
```

---

### Task 9: Статика, auth/profile, фінальна чистка

**Files:**

- Modify: усі SCSS з хардкодами старої палітри (список дає греп у Step 1)
- Modify: `src/app/not-found.tsx` (variant yellow → primary)
- Modify: `src/shared/components/Card/Card.module.scss`, `src/shared/components/Input/Input.module.scss`, `src/shared/components/Select/select.module.scss`, `src/shared/components/SearchInput/SearchInput.module.scss` (спільні компоненти, що лишилися)

**Interfaces:**

- Consumes: токени. Це фінальний прохід — після нього стара палітра не існує в коді.

- [ ] **Step 1: Знайти всі залишки**

Run: `grep -rnE '#33603b|#e0ddca|#e6db1b|#2b2b27|#edecda|#254a2c|glitch|Rubik' src/ --include='*.scss' --include='*.tsx' --include='*.ts' | grep -v telegram | grep -v admin`

- [ ] **Step 2: Замінити кожен збіг**

Правила заміни (ті самі, що Tasks 5–7): фони бежевий/зелений → `var(--background)` / `var(--background-secondary)`; жовтий акцент → `var(--accent)` або чорний за контекстом; текст → `var(--text-primary)`/`var(--text-secondary)`; glitch-класи/keyframes — видалити; `Rubik` у SCSS → `var(--font-heading)`. У `not-found.tsx`: `variant="yellow"` → `variant="primary"`. Файли правити по одному, читаючи контекст.

- [ ] **Step 3: Контрольний греп**

Run: той самий греп зі Step 1.
Expected: 0 збігів (поза `/telegram`, `/admin`).

- [ ] **Step 4: Повна верифікація**

Run: `npm run build && npm run lint`
Expected: green. Dev — ручний прохід флоу: головна → каталог → товар (з варіантами) → кошик (видалення+undo) → чекаут → success. Скріншоти на 375px і 1440px: головна, каталог, товар, чекаут. Перевірити фокус-обводку (Tab по хедеру) — синя 3px.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(v2): final Diia cleanup - static pages, shared components, zero legacy palette"
```

---

### Task 10: Градієнтний фон + карткова основа (шар застосунку)

**Files:**

- Modify: `src/app/globals.css` (нові токени градієнта, фон body)
- Modify: `src/widgets/Header/header.module.scss` (напівпрозорий blur-хедер)
- Modify: `src/shared/components/Card/Card.module.scss` (тінь картки на градієнті)

**Interfaces:**

- Produces: токени `--gradient-brand` (повносилий), `--gradient-page` (розбавлений), `--surface-card` (біла картка). Наступні таски кладуть контент на `--surface-card` поверх `--gradient-page`.

- [ ] **Step 1: Токени градієнта в globals.css**

Додати в `:root`:

```css
--gradient-brand: linear-gradient(35.8deg, #c3aab2 -4.77%, #99eecc 46.72%, #80c0c8 90.23%, #4b8bfa 134.46%);
--gradient-page:
  linear-gradient(rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.82)),
  linear-gradient(35.8deg, #c3aab2 -4.77%, #99eecc 46.72%, #80c0c8 90.23%, #4b8bfa 134.46%);
--surface-card: #ffffff;
```

`html, body` і `main`: `background: var(--gradient-page) fixed;` (замість білого). Перевірити, що `background-attachment: fixed` не ламає мобільний скрол (iOS fallback: без fixed на <768px).

- [ ] **Step 2: Хедер — системний бар застосунку**

`.wrapper` у header.module.scss: `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`.

- [ ] **Step 3: Верифікація + Commit**

`npm run build` green. Commit: `feat(v2.1): Diia app gradient background + translucent header`

---

### Task 11: Контент у картки-«документи» по всіх екранах

**Files:**

- Modify: `src/app/home.module.scss` (hero → повносилий `--gradient-brand`, білий текст або темний по контрасту — перевірити читабельність)
- Modify: `src/app/catalog/catalog.module.scss` (фільтри вже в картці; сітка без змін — ProductCard вже білі картки)
- Modify: `src/shared/styles/productDetails.module.scss` + `src/app/catalog/[slug]/productDetails.module.scss` (галерея і інфо-колонка — окремі білі картки)
- Modify: `src/app/cart/Cart.module.scss`, `src/features/checkout/components/CheckoutForm/CheckoutForm.module.scss` (секції — білі картки; підсумок-«документ» → `--gradient-brand` фон з білою внутрішньою карткою даних, як картка документа в застосунку)
- Modify: auth-форми (`AuthDrawer.module.scss`) і статичні сторінки (`about`, `faq`, `delivery-and-payment`, `public-offer`, `privacy-policy`, `returns-exchanges`, `contact` module.scss) — контент у білу картку radius 24px, великий e-UkraineHead заголовок ЗВЕРХУ поза карткою
- Modify: `src/app/checkout/success/CheckoutSuccess.module.scss`, `failed` — картка поверх градієнта

**Правила:** картка = `background: var(--surface-card); border-radius: var(--border-radius-md або -lg); box-shadow: var(--shadow-sm)`; заголовок екрана поза карткою `var(--font-heading)`; метадані в картках `var(--text-sm) var(--text-secondary) var(--fw-light)`. Контраст текст/фон на градієнті — перевіряти (WCAG 4.5:1).

- [ ] Прохід по файлах за правилами, build green, commit: `feat(v2.1): document-card surfaces across all screens`

---

### Task 12: Ілюстрації категорій через RunningHub

**Files:**

- Create: `scripts/generate_category_illustrations.py` (за патерном `F:\Progect\2026\smm-factory\scripts\generate_emark_slug_illustrations.py`)
- Create: `public/assets/img/categories/<slug>.webp` (згенеровані)
- Modify: `src/app/Home.tsx` + `home.module.scss` (картка категорії з ілюстрацією + fallback)

**Механіка:** RunningHub API (`https://www.runninghub.ai`), воркфлоу Flux.1-dev `1823665769094754305`, ключ з `F:\Progect\2026\smm-factory\.env` (`RUNNINGHUB_API_KEY`); override нод 43 (t5xxl/clip_l/guidance), 37 (розмір 1024), 17 (steps 40), 25 (seed), 57 (lora); полінг `/task/openapi/status` кожні 10с; `uvx transparent-background` cutout → Pillow crop-to-alpha → webp (Pillow, без ffmpeg). Промпти: чистий 3D-рендер мерчу (біла футболка/худі/кепка/аксесуар) на нейтральному фоні, без тексту й лого — стиль референс-скрипта v1/v2. Слаги взяти з реальних категорій (стор/АПІ; якщо бекенд офлайн — базовий набір t-shirts/hoodies/caps/accessories + generic fallback `category-generic.webp`).

- [ ] Скрипт → smoke-тест 1 кадру → повний батч → вайринг у категорійні картки з fallback → build green → commit: `feat(v2.1): category illustrations via RunningHub`

---

## Self-Review (виконано при написанні)

- **Spec coverage:** токени/типографіка → Task 2; шрифти+ліцензія (CC BY 4.0 підтверджена, атрибуція → Task 4 Step 4) → Task 1; Button/Badge/інпути/checkbox/modal → Task 3; Header/Footer + фікси №3,7,9,11,13 → Task 4; каталог + №1,4,5,6,15a → Task 5; товар + №10 → Task 6; кошик/чекаут + №8,12,14,15b → Task 7; головна + №2 → Task 8; статика/чистка → Task 9. Фікси №4a/4b у Task 5. Всі 15 фіксів покриті.
- **Placeholder scan:** кроки з «звірити сигнатуру перед використанням» (addItem, categories store, PopularProductsSlider) — свідомі verify-before-use інструкції з фолбеком, не TBD.
- **Type consistency:** Button/Badge API незмінні (перевірено по коду); токен-імена в усіх тасках збігаються з Task 2.

# Побажання покупців (слот чату в навбарі + шторка + Telegram) — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Кнопка меню в хедері кожні 5 с «тане в блюрі» і поступається кнопці чату; тап по ній відкриває нижню шторку з запитанням «Що нам ще розробити?», а текст побажання летить в адмін-чат Telegram.

**Architecture:** Слот у правій групі хедера (`widgets/Header/MenuSlot`) тримає обидві кнопки одна на одній і перемикає їх за фазою хука `useSlotAlternation`; прихована кнопка отримує `inert`. Шторка живе у фічі `features/wishes` на `shared/components/Sheet` і шле форму через `fetch` на новий роут `app/api/telegram/wishes`, який перевіряє тіло чистою логікою з `features/wishes/lib` і викликає Telegram Bot API без `parse_mode`.

**Tech Stack:** Next.js 16 App Router (route handler), React 19 (`inert`), Mantine 8 (`Drawer` через `Sheet`, `Textarea`, `TextInput`), SCSS-модулі з токенами `globals.css`, Node 24 для перевірочного скрипта без тестового раннера.

**Spec:** `docs/superpowers/specs/2026-09-17-wishes-chat-slot-design.md`

## Global Constraints

- Гілка `v2`; пушить власник, виконавець лише комітить.
- FSD: `app → widgets → features → shared`, без імпортів між фічами; `shared` не імпортує з `features`.
- Стилі: один метод на елемент, SCSS-модулі лише для `:hover`/переходів/медіа; кольори й розміри тільки з токенів `globals.css` (`--dur-modal`, `--ease-in-out`, `--space-*`, `--text-*`, `--error`), жодного hex у компонентах.
- Ліміти: компонент ≤ 150 рядків, функція ≤ 50, до 2 рівнів `if`.
- Копі — лише через `content.wishes` у `src/shared/config/content.ts`.
- Такт: `SLOT_PERIOD_MS = 5000`, фази `'menu' | 'chat'`, стартова `'menu'`, без зупинки.
- Слот видимий лише до 1023px (успадковує медіа-правило `.iconButton`).
- Роут: `POST /api/telegram/wishes`; текст 3–1000 символів після `trim`, контакт ≤ 100, `page` ≤ 200 і починається з `/`; honeypot-поле `website`; без `parse_mode`; час `toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })`; змінні `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (уже є в `.env.local` і на Vercel).
- Не додавати нових залежностей і тестових раннерів.
- Pre-commit хук запускає `prettier --write .` але НЕ стейджить результат: перед `git add` завжди `npx prettier --write <файли задачі>`.
- QA-закон проєкту: не запускати `npm run build`, поки працює `next dev` (обидва пишуть у `.next`).
- Автотестів у проєкті немає; кожна задача завершується `npx tsc --noEmit` і ручною перевіркою, описаною в кроках.

---

## Структура файлів

| Файл                                                   | Дія   | Відповідальність                                                   |
| ------------------------------------------------------ | ----- | ------------------------------------------------------------------ |
| `src/shared/components/Svg/IconChat.tsx`               | новий | іконка бульбашки, сітка як у `MenuIcon`                            |
| `src/shared/components/Svg/index.ts`                   | зміна | експорт `IconChat`                                                 |
| `src/shared/config/content.ts`                         | зміна | блок `wishes`                                                      |
| `src/widgets/Header/MenuSlot.tsx`                      | новий | дві кнопки в одному слоті, `inert`, обробники утримання            |
| `src/widgets/Header/useSlotAlternation.ts`             | новий | такт 5/5, утримання, пауза, `visibilitychange`                     |
| `src/widgets/Header/header.module.scss`                | зміна | `.slot`, `.slotItem`, reduced-motion                               |
| `src/widgets/Header/Header.tsx`                        | зміна | `MenuSlot` замість лінка на /menu, стан шторки, рендер `WishSheet` |
| `src/features/wishes/lib/wish-message.ts`              | новий | `validateWish`, `formatWishMessage` — чиста логіка без імпортів    |
| `scripts/check-wish-message.mjs`                       | новий | перевірки логіки, `node scripts/check-wish-message.mjs`            |
| `src/app/api/telegram/wishes/route.ts`                 | новий | honeypot, валідація, Telegram, коди відповіді                      |
| `src/features/wishes/api/wishes-api.ts`                | новий | `wishesApi.sendWish`                                               |
| `src/features/wishes/components/WishSheet.tsx`         | новий | шторка, форма, стани `idle/sending/error`                          |
| `src/features/wishes/components/WishSheetResult.tsx`   | новий | стан `sent` і рядок помилки (щоб `WishSheet` лишався ≤ 150 рядків) |
| `src/features/wishes/components/WishSheet.module.scss` | новий | розкладка форми, підпис, рядок помилки, стан «надіслано»           |
| `src/features/wishes/index.ts`                         | новий | публічний експорт фічі                                             |

---

### Task 1: Статичний слот у хедері (іконка, копі, `MenuSlot`, стилі)

**Files:**

- Create: `src/shared/components/Svg/IconChat.tsx`
- Modify: `src/shared/components/Svg/index.ts` (після рядка `export { IconTelegram } ...`)
- Modify: `src/shared/config/content.ts` (перед коментарем `// ===== КНОПКИ =====`)
- Create: `src/widgets/Header/MenuSlot.tsx`
- Modify: `src/widgets/Header/header.module.scss` (після блоку `.iconButton`, перед `.cartButton`)
- Modify: `src/widgets/Header/Header.tsx:33` (імпорт) і `src/widgets/Header/Header.tsx:237-239` (лінк «Меню»)

**Interfaces:**

- Produces: `MenuSlot({ paused: boolean; onOpenWishes: () => void })` — компонент; `content.wishes` — обʼєкт копі з ключами `triggerLabel, title, hint, messageLabel, messagePlaceholder, messageError, contactLabel, contactPlaceholder, submit, close, sentTitle, sentText, done, errorText, errorLink`; `IconChat({ size?: number })`.
- У цій задачі фаза слота зафіксована рядком `const phase: SlotPhase = 'menu';` — Task 2 замінює його на виклик хука.

- [ ] **Step 1: Іконка `IconChat`**

Створи `src/shared/components/Svg/IconChat.tsx`:

```tsx
// Бульбашка повідомлення для слота «Запропонувати ідею» в хедері — та сама
// сітка й товщина лінії, що в MenuIcon (24, stroke 1.75, круглі кінці).
// Контур узято з tabler/message-circle: мʼякий хвостик знизу зліва, без
// «трикутника» під обріз, оптичний розмір як у трьох ліній бургера.
import React from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

export function IconChat({ className, size = 24, ...props }: IconProps) {
  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
    </svg>
  );
}
```

У `src/shared/components/Svg/index.ts` додай останнім рядком:

```ts
export { IconChat } from './IconChat';
```

- [ ] **Step 2: Копі `content.wishes`**

У `src/shared/config/content.ts` перед рядком `// ===== КНОПКИ =====` встав:

```ts
  // ===== ПОБАЖАННЯ (шторка «Що нам ще розробити?») =====
  wishes: {
    triggerLabel: 'Запропонувати ідею',
    title: 'Що нам ще розробити?',
    hint: 'Розкажи, чого бракує. Читаємо все.',
    messageLabel: 'Побажання',
    messagePlaceholder: 'Я би хотів, щоб ви розробили штани',
    messageError: 'Напиши хоч кілька слів',
    contactLabel: 'Телефон або Telegram',
    contactPlaceholder: '+380… або @нік',
    submit: 'Надіслати',
    close: 'Закрити',
    sentTitle: 'Дякуємо!',
    sentText: 'Ми прочитаємо і подумаємо.',
    done: 'Готово',
    errorText: 'Не надіслалось. Спробуй ще раз або напиши нам у ',
    errorLink: 'Telegram',
  },

```

- [ ] **Step 3: Стилі слота**

У `src/widgets/Header/header.module.scss` одразу після закривної дужки блоку `.iconButton` (перед `.cartButton {`) додай:

```scss
// Слот меню/чат (MenuSlot): дві кнопки одна на одній, видима — одна, за
// фазою такту useSlotAlternation. Медіа-правило те саме, що в .iconButton,
// інакше від 1024px лишився б порожній 44px проміжок перед кошиком.
.slot {
  position: relative;
  width: 44px;
  height: 44px;

  @media (min-width: 1024px) {
    display: none;
  }
}

// «Тане в блюрі»: стара кнопка розмивається і зникає, нова приходить
// зворотним шляхом, обидві одночасно. --dur-modal — це «поява шару», не
// морфінг на екрані. Blur на 44×44 дешевий: застереження DESIGN_SYSTEM.md
// стосується blur-пульсу скелетонів на весь блок.
// border/padding: другий елемент слота — <button>, .iconButton писався під <a>.
.slotItem {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  cursor: pointer;
  transition:
    opacity var(--dur-modal) var(--ease-in-out),
    filter var(--dur-modal) var(--ease-in-out),
    transform var(--dur-modal) var(--ease-in-out),
    background var(--dur-hover) var(--ease-out);

  &[data-shown='false'] {
    opacity: 0;
    filter: blur(6px);
    transform: scale(0.9);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--dur-modal) var(--ease-in-out);

    &[data-shown='false'] {
      filter: none;
      transform: none;
    }
  }
}
```

- [ ] **Step 4: Компонент `MenuSlot` (поки з фіксованою фазою)**

Створи `src/widgets/Header/MenuSlot.tsx`:

```tsx
// src/widgets/Header/MenuSlot.tsx
// Слот правої групи хедера: кнопка меню і кнопка чату лежать одна на одній,
// видима — одна, за фазою такту (useSlotAlternation, спека
// docs/superpowers/specs/2026-09-17-wishes-chat-slot-design.md).
//
// Прихована кнопка отримує inert: випадає з табу й дерева доступності і не
// ловить кліки, тож тап у перехідні 220 мс не потрапляє в «привида».
// Окремих aria-hidden/tabIndex не треба — inert робить усе разом.
// Live-region свідомо нема: оголошувати зміну кожні 5 с — шум для скрінрідера.
'use client';

import Link from 'next/link';
import styles from './header.module.scss';
import { IconChat, MenuIcon } from '@/shared/components/Svg';
import { content } from '@/shared/config/content';

export type SlotPhase = 'menu' | 'chat';

interface MenuSlotProps {
  /** Шторка побажань відкрита — такт стоїть на паузі */
  paused: boolean;
  onOpenWishes: () => void;
}

// paused поки не читається: Task 2 передає його в useSlotAlternation
export function MenuSlot({ onOpenWishes }: MenuSlotProps) {
  // Task 2 замінює цей рядок на виклик useSlotAlternation(paused)
  const phase: SlotPhase = 'menu';
  const menuShown = phase === 'menu';

  return (
    <div className={styles.slot}>
      <Link
        href="/menu"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={menuShown}
        inert={!menuShown}
        aria-label="Меню">
        <MenuIcon />
      </Link>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={!menuShown}
        inert={menuShown}
        aria-label={content.wishes.triggerLabel}
        onClick={onOpenWishes}>
        <IconChat />
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Підключити слот у `Header.tsx`**

Рядок 33 `import { IconCart, IconCatalog, MenuIcon } from '@/shared/components/Svg';` заміни на два рядки:

```tsx
import { IconCart, IconCatalog } from '@/shared/components/Svg';
import { MenuSlot } from './MenuSlot';
```

Рядки 237–239

```tsx
<Link href="/menu" className={styles.iconButton} aria-label="Меню">
  <MenuIcon />
</Link>
```

заміни на

```tsx
{
  /* Слот меню/чат: paused і onOpenWishes отримують стан шторки в Task 5 */
}
<MenuSlot paused={false} onOpenWishes={() => undefined} />;
```

- [ ] **Step 6: Типи і рендер**

Run: `npx tsc --noEmit`
Expected: без виводу, код виходу 0. (Якщо `inert` не приймається — переконайся, що `@types/react` 19.2.7 з `package.json`; у ній `inert?: boolean` є.)

Run: `npm run dev`, відкрий `http://localhost:3000/` у Chrome з емуляцією 390px.
Expected: у правій групі хедера бургер «Меню» на своєму місці, іконки чату не видно. У DevTools → Elements усередині `div.slot` два вузли: `a[data-shown="true"]` і `button[data-shown="false"][inert]`. Тап по бургеру відкриває `/menu`.

Переключи емуляцію на 1280px.
Expected: між іконкою «Каталог» і кошиком немає порожнього 44px проміжку; слот у DOM має `display: none`.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/shared/components/Svg/IconChat.tsx src/shared/components/Svg/index.ts src/shared/config/content.ts src/widgets/Header/MenuSlot.tsx src/widgets/Header/header.module.scss src/widgets/Header/Header.tsx
git add src/shared/components/Svg/IconChat.tsx src/shared/components/Svg/index.ts src/shared/config/content.ts src/widgets/Header/MenuSlot.tsx src/widgets/Header/header.module.scss src/widgets/Header/Header.tsx
git commit -m "feat(header): слот меню/чат — дві кнопки в одному місці, поки без такту

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Такт 5/5 — хук `useSlotAlternation`

**Files:**

- Create: `src/widgets/Header/useSlotAlternation.ts`
- Modify: `src/widgets/Header/MenuSlot.tsx` (рядок із фіксованою фазою і обгортка `.slot`)

**Interfaces:**

- Consumes: `MenuSlot` з Task 1, тип `SlotPhase`.
- Produces: `useSlotAlternation(paused: boolean): { phase: SlotPhase; holdHandlers: { onPointerEnter; onPointerLeave; onFocus; onBlur } }`; константа `SLOT_PERIOD_MS = 5000`. `SlotPhase` переїжджає в хук і реекспортується з `MenuSlot`.

- [ ] **Step 1: Хук такту**

Створи `src/widgets/Header/useSlotAlternation.ts`:

```ts
// src/widgets/Header/useSlotAlternation.ts
// Такт слота меню/чат: 5 с меню, 5 с чат, по колу, без зупинки (рішення
// власника, спека 2026-09-17-wishes-chat-slot-design.md).
//
// Стартова фаза 'menu' однакова на сервері й клієнті, таймер живе лише
// в useEffect — гідрація не розходиться. Три правила поверх такту:
//  • утримання: поки на слоті ховер або фокус, тік пропускається — кнопка
//    не зникає з-під пальця чи курсора; наступна перевірка через 5 с;
//  • пауза (шторка відкрита): інтервалу нема, при знятті — 'menu' і відлік
//    заново, щоб після закриття шторки хедер був звичним;
//  • прихована вкладка: браузер тротлить таймери у фоні, тож на поверненні
//    фаза скидається на 'menu' і інтервал перезапускається.
//
// Скидання фази при знятті паузи зроблено «під час рендера» (той самий
// прийом, що seenRoute у Header.tsx): setState у тілі ефекту — помилка
// правила react-hooks/set-state-in-effect.
'use client';

import { useEffect, useRef, useState } from 'react';

export type SlotPhase = 'menu' | 'chat';

export const SLOT_PERIOD_MS = 5000;

export const useSlotAlternation = (paused: boolean) => {
  const [phase, setPhase] = useState<SlotPhase>('menu');
  // Ref, а не стан: зміна утримання не має перерендерювати хедер,
  // вона лише впливає на наступний тік.
  const heldRef = useRef(false);
  // Інкремент перезапускає інтервал (повернення у вкладку)
  const [epoch, setEpoch] = useState(0);

  const [seenPaused, setSeenPaused] = useState(paused);
  if (seenPaused !== paused) {
    setSeenPaused(paused);
    if (!paused) setPhase('menu');
  }

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (heldRef.current) return;
      setPhase((p) => (p === 'menu' ? 'chat' : 'menu'));
    }, SLOT_PERIOD_MS);
    return () => window.clearInterval(id);
  }, [paused, epoch]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      setPhase('menu');
      setEpoch((e) => e + 1);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const hold = () => {
    heldRef.current = true;
  };
  const release = () => {
    heldRef.current = false;
  };

  return {
    phase,
    holdHandlers: { onPointerEnter: hold, onPointerLeave: release, onFocus: hold, onBlur: release },
  };
};
```

- [ ] **Step 2: Підключити хук у `MenuSlot`**

У `src/widgets/Header/MenuSlot.tsx`:

1. Видали рядок `export type SlotPhase = 'menu' | 'chat';` і додай до імпортів:

```tsx
import { useSlotAlternation, type SlotPhase } from './useSlotAlternation';

export type { SlotPhase };
```

2. Три рядки

```tsx
// paused поки не читається: Task 2 передає його в useSlotAlternation
export function MenuSlot({ onOpenWishes }: MenuSlotProps) {
  // Task 2 замінює цей рядок на виклик useSlotAlternation(paused)
  const phase: SlotPhase = 'menu';
```

заміни на

```tsx
export function MenuSlot({ paused, onOpenWishes }: MenuSlotProps) {
  const { phase, holdHandlers } = useSlotAlternation(paused);
```

3. Обгортку `<div className={styles.slot}>` заміни на `<div className={styles.slot} {...holdHandlers}>`.

React передає `onFocus`/`onBlur` як `focusin`/`focusout`, тож фокус на будь-якій із двох кнопок усередині рахується як утримання.

- [ ] **Step 3: Перевірка такту**

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

Run: `npm run dev`, `http://localhost:3000/`, емуляція 390px, курсор поза хедером.
Expected: через 5 с бургер розмивається і на його місці проявляється бульбашка чату (перехід ≈ 0.2 с, без стрибка); ще через 5 с — назад. Атрибути `data-shown`/`inert` міняються місцями на кожному тіку.

Наведи курсор на слот і тримай 12 с.
Expected: кнопка під курсором не змінюється; після відведення курсора зміна відбувається на наступному тіку (до 5 с).

Tab до кнопки слота, тримай фокус 12 с.
Expected: те саме — під фокусом підміни нема; Enter відкриває `/menu`.

DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.
Expected: перехід лише прозорістю, без розмиття й масштабу.

Переключись на іншу вкладку на 30 с, повернись.
Expected: у слоті бургер «Меню», далі такт із нуля.

- [ ] **Step 4: Commit**

```bash
npx prettier --write src/widgets/Header/useSlotAlternation.ts src/widgets/Header/MenuSlot.tsx
git add src/widgets/Header/useSlotAlternation.ts src/widgets/Header/MenuSlot.tsx
git commit -m "feat(header): такт 5/5 — меню тане в блюрі, замість нього кнопка чату

Утримання на ховері/фокусі, пауза для шторки, скидання на «меню» після
повернення у вкладку.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Чиста логіка роуту — `validateWish`, `formatWishMessage` + перевірки

**Files:**

- Create: `src/features/wishes/lib/wish-message.ts`
- Create: `scripts/check-wish-message.mjs`

**Interfaces:**

- Produces:
  - `interface WishInput { message: string; contact?: string; page?: string }`
  - `type WishValidation = { ok: true; wish: WishInput } | { ok: false; error: string }`
  - `validateWish(body: unknown): WishValidation`
  - `formatWishMessage(wish: WishInput, siteUrl: string, now: Date): string`
  - константи `WISH_MESSAGE_MIN = 3`, `WISH_MESSAGE_MAX = 1000`, `WISH_CONTACT_MAX = 100`, `WISH_PAGE_MAX = 200`.
- Модуль без жодного імпорту: його запускає звичайний `node` (Node 24 стріпає типи), тому `siteUrl` і `now` передаються параметрами, а не читаються з конфігу.

- [ ] **Step 1: Скрипт перевірок (спершу він, щоб побачити червоне)**

Створи `scripts/check-wish-message.mjs`:

```js
// scripts/check-wish-message.mjs
// Перевірки чистої логіки роуту побажань (features/wishes/lib/wish-message.ts).
// Тестового раннера в проєкті нема, тому звичайний node + node:assert:
//   node scripts/check-wish-message.mjs
// .mjs, а не .ts: tsconfig включає **/*.ts і не дозволяє імпорт з .ts-розширенням.
import assert from 'node:assert/strict';
import { validateWish, formatWishMessage } from '../src/features/wishes/lib/wish-message.ts';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

check('порожній текст → помилка', () => {
  assert.deepEqual(validateWish({ message: '   ' }), { ok: false, error: 'Напиши хоч кілька слів' });
});

check('два символи → помилка, три → ок', () => {
  assert.equal(validateWish({ message: 'ab' }).ok, false);
  assert.equal(validateWish({ message: 'abc' }).ok, true);
});

check('1001 символ → помилка, 1000 → ок', () => {
  assert.equal(validateWish({ message: 'x'.repeat(1001) }).ok, false);
  assert.equal(validateWish({ message: 'x'.repeat(1000) }).ok, true);
});

check('текст обрізається по краях, порожній контакт → undefined', () => {
  assert.deepEqual(validateWish({ message: '  штани  ', contact: '  ' }), {
    ok: true,
    wish: { message: 'штани', contact: undefined, page: undefined },
  });
});

check('контакт обрізається до 100 символів', () => {
  const r = validateWish({ message: 'штани', contact: 'a'.repeat(150) });
  assert.equal(r.ok && r.wish.contact.length, 100);
});

check('page без / або довший за 200 ігнорується, коректний лишається', () => {
  assert.equal(validateWish({ message: 'штани', page: 'http://x' }).wish.page, undefined);
  assert.equal(validateWish({ message: 'штани', page: '/' + 'a'.repeat(200) }).wish.page, undefined);
  assert.equal(validateWish({ message: 'штани', page: '/catalog' }).wish.page, '/catalog');
});

check('не-рядки і порожнє тіло не валять', () => {
  assert.equal(validateWish({ message: 42 }).ok, false);
  assert.equal(validateWish(null).ok, false);
  assert.equal(validateWish({ message: 'штани', contact: 7, page: 9 }).ok, true);
});

check('формат повідомлення з контактом і сторінкою', () => {
  const text = formatWishMessage(
    { message: 'штани *_[]()', contact: '@nick', page: '/catalog' },
    'https://www.ye-dril.com',
    new Date('2026-09-17T12:00:00Z')
  );
  assert.equal(
    text,
    [
      '#побажання',
      'Побажання з сайту',
      '',
      'штани *_[]()',
      '',
      'Контакт: @nick',
      'Сторінка: https://www.ye-dril.com/catalog',
      'Час: 17.09.2026, 15:00:00',
    ].join('\n')
  );
});

check('формат без контакту і без сторінки', () => {
  const text = formatWishMessage(
    { message: 'штани' },
    'https://www.ye-dril.com',
    new Date('2026-09-17T12:00:00Z')
  );
  assert.equal(text.includes('Контакт: не залишено'), true);
  assert.equal(text.includes('Сторінка:'), false);
});

console.log(`ok: ${n} checks`);
```

- [ ] **Step 2: Переконатись, що перевірки падають**

Run: `node scripts/check-wish-message.mjs`
Expected: помилка `Cannot find module '.../src/features/wishes/lib/wish-message.ts'` (модуля ще нема).

- [ ] **Step 3: Логіка**

Створи `src/features/wishes/lib/wish-message.ts`:

```ts
// src/features/wishes/lib/wish-message.ts
// Чиста логіка роуту /api/telegram/wishes: перевірка тіла запиту і текст
// повідомлення в адмін-чат. Без імпортів — це дає прогнати її звичайним
// `node scripts/check-wish-message.mjs` (тестового раннера в проєкті нема).
// Honeypot тут не перевіряється: це справа роуту, бо на нього відповідь
// «успіх», а не помилка.

export const WISH_MESSAGE_MIN = 3;
export const WISH_MESSAGE_MAX = 1000;
export const WISH_CONTACT_MAX = 100;
export const WISH_PAGE_MAX = 200;

export interface WishInput {
  message: string;
  contact?: string;
  page?: string;
}

export type WishValidation = { ok: true; wish: WishInput } | { ok: false; error: string };

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Тіло запиту (будь-що з request.json()) → перевірене побажання або помилка 400. */
export const validateWish = (body: unknown): WishValidation => {
  const raw = (body ?? {}) as Record<string, unknown>;
  const message = asString(raw.message).trim();
  if (message.length < WISH_MESSAGE_MIN || message.length > WISH_MESSAGE_MAX) {
    return { ok: false, error: 'Напиши хоч кілька слів' };
  }
  const contact = asString(raw.contact).trim().slice(0, WISH_CONTACT_MAX);
  const page = asString(raw.page);
  const pageOk = page.startsWith('/') && page.length <= WISH_PAGE_MAX;
  return { ok: true, wish: { message, contact: contact || undefined, page: pageOk ? page : undefined } };
};

/** Плоский текст для sendMessage без parse_mode: зірочки й підкреслення
 *  користувача лишаються символами, а не розміткою. */
export const formatWishMessage = (wish: WishInput, siteUrl: string, now: Date): string => {
  const lines = [
    '#побажання',
    'Побажання з сайту',
    '',
    wish.message,
    '',
    `Контакт: ${wish.contact ?? 'не залишено'}`,
  ];
  if (wish.page) lines.push(`Сторінка: ${siteUrl}${wish.page}`);
  lines.push(`Час: ${now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`);
  return lines.join('\n');
};
```

- [ ] **Step 4: Перевірки зелені**

Run: `node scripts/check-wish-message.mjs`
Expected: девʼять рядків `ok - …` і останній `ok: 9 checks`, код виходу 0.

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/features/wishes/lib/wish-message.ts scripts/check-wish-message.mjs
git add src/features/wishes/lib/wish-message.ts scripts/check-wish-message.mjs
git commit -m "feat(wishes): чиста логіка побажання — валідація тіла і текст для Telegram

Перевірки: node scripts/check-wish-message.mjs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Роут `POST /api/telegram/wishes`

**Files:**

- Create: `src/app/api/telegram/wishes/route.ts`

**Interfaces:**

- Consumes: `validateWish`, `formatWishMessage` з Task 3; `siteConfig.url` з `@/shared/config/site`.
- Produces: `POST /api/telegram/wishes` з тілом `{ message: string; contact?: string; page?: string; website?: string }` → `200 { success: true }` | `400 { success: false; message }` | `500 { success: false; message }`.

- [ ] **Step 1: Роут**

Створи `src/app/api/telegram/wishes/route.ts`:

```ts
// src/app/api/telegram/wishes/route.ts
// Побажання зі шторки (features/wishes) → адмін-чат Telegram. Той самий бот
// і чат, що в ../route.ts і ../notify-availability/route.ts. Відмінності
// свідомі: honeypot, серверні ліміти довжини (логіка у features/wishes/lib),
// текст без parse_mode (Markdown у сусідніх роутах ламається на зірочці
// в тексті користувача) і явний київський час (Vercel живе в UTC).
import { NextRequest, NextResponse } from 'next/server';
import { validateWish, formatWishMessage } from '@/features/wishes/lib/wish-message';
import { siteConfig } from '@/shared/config/site';

const TELEGRAM_API = 'https://api.telegram.org';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Напиши хоч кілька слів' }, { status: 400 });
  }

  // Honeypot: поле бачать лише боти. Відповідаємо як на успіх —
  // бот не має дізнатись, що його впіймали.
  const website = (body as { website?: unknown } | null)?.website;
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ success: true });
  }

  const validation = validateWish(body);
  if (!validation.ok) {
    return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error('Wishes: missing Telegram configuration');
    return NextResponse.json({ success: false, message: 'Помилка конфігурації' }, { status: 500 });
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatWishMessage(validation.wish, siteConfig.url, new Date()),
      }),
    });
    if (!response.ok) {
      console.error('Wishes: Telegram API error', await response.text());
      throw new Error('telegram');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishes: send failed', error);
    return NextResponse.json({ success: false, message: 'Помилка відправлення' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Типи**

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

- [ ] **Step 3: Перевірка через curl (dev-сервер із `.env.local`, у якому є `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID`)**

Run: `npm run dev` в одному терміналі, у другому:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/telegram/wishes \
  -H 'Content-Type: application/json' -d '{"message":"ab"}'
```

Expected: `400`.

```bash
curl -s -w '\n%{http_code}\n' -X POST http://localhost:3000/api/telegram/wishes \
  -H 'Content-Type: application/json' -d '{"message":"бот пише","website":"http://spam"}'
```

Expected: `{"success":true}` і `200`; в адмін-чаті Telegram НІЧОГО не зʼявилось.

```bash
curl -s -w '\n%{http_code}\n' -X POST http://localhost:3000/api/telegram/wishes \
  -H 'Content-Type: application/json' -d '{"message":"тест побажань *_[]() — видалити","contact":"@test","page":"/catalog"}'
```

Expected: `{"success":true}` і `200`; в адмін-чаті повідомлення з тегом `#побажання`, текстом із усіма символами, `Контакт: @test`, `Сторінка: https://www.ye-dril.com/catalog`, київським часом.

```bash
curl -s -w '\n%{http_code}\n' -X POST http://localhost:3000/api/telegram/wishes \
  -H 'Content-Type: application/json' -d 'not json'
```

Expected: `{"success":false,"message":"Напиши хоч кілька слів"}` і `400`.

- [ ] **Step 4: Commit**

```bash
npx prettier --write src/app/api/telegram/wishes/route.ts
git add src/app/api/telegram/wishes/route.ts
git commit -m "feat(api): роут побажань /api/telegram/wishes — honeypot, ліміти, без Markdown

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Шторка `WishSheet` і проводка в хедер

**Files:**

- Create: `src/features/wishes/api/wishes-api.ts`
- Create: `src/features/wishes/components/WishSheet.module.scss`
- Create: `src/features/wishes/components/WishSheetResult.tsx`
- Create: `src/features/wishes/components/WishSheet.tsx`
- Create: `src/features/wishes/index.ts`
- Modify: `src/widgets/Header/Header.tsx` (імпорт, стан, `MenuSlot`, рендер після `<CartDrawer />`)

**Interfaces:**

- Consumes: `MenuSlot({ paused, onOpenWishes })` з Task 1–2; роут з Task 4; `Sheet({ opened, onClose, title, children })` з `@/shared/components/Sheet`; `Input`, `TextareaField` з `@/shared/components/Input`; `Button` з `@/shared/components/Button/Button`; `content.wishes`; `siteConfig.socials.telegram`.
- Produces: `WishSheet({ opened: boolean; onClose: () => void })`; `wishesApi.sendWish(data: WishRequest): Promise<WishResponse>`.

- [ ] **Step 1: Клієнтський API**

Створи `src/features/wishes/api/wishes-api.ts`:

```ts
// src/features/wishes/api/wishes-api.ts
// Той самий контракт { success, message }, що в notify-availability.
export interface WishRequest {
  message: string;
  contact?: string;
  /** window.location.pathname — з якої сторінки написали */
  page: string;
  /** Honeypot — у людини завжди порожній рядок */
  website?: string;
}

export interface WishResponse {
  success: boolean;
  message?: string;
}

export const wishesApi = {
  sendWish: async (data: WishRequest): Promise<WishResponse> => {
    const response = await fetch('/api/telegram/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = (await response.json().catch(() => ({}))) as WishResponse;
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Помилка відправлення');
    }
    return result;
  },
};
```

- [ ] **Step 2: Стилі шторки**

Створи `src/features/wishes/components/WishSheet.module.scss`:

```scss
// src/features/wishes/components/WishSheet.module.scss
// Горизонтальний падінг дає Sheet.body (--card-padding); тут — лише вертикаль
// і відступи між рядами. padding-bottom: щоб остання кнопка не сідала на
// нижній край шторки.
.form,
.sent {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
}

.hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.sentTitle {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--fw-medium);
}

.error {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--error);

  a {
    color: inherit;
    text-decoration: underline;
  }
}
```

- [ ] **Step 3: Стан «надіслано» і рядок помилки**

Створи `src/features/wishes/components/WishSheetResult.tsx`:

```tsx
// src/features/wishes/components/WishSheetResult.tsx
// Стан «надіслано» і рядок помилки шторки побажань — окремо, щоб WishSheet
// лишався в межах 150 рядків (CLAUDE.md).
'use client';

import { Button } from '@/shared/components/Button/Button';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import styles from './WishSheet.module.scss';

interface WishSentProps {
  onDone: () => void;
}

export const WishSent = ({ onDone }: WishSentProps) => (
  <div className={styles.sent} role="status">
    <p className={styles.sentTitle}>{content.wishes.sentTitle}</p>
    <p className={styles.hint}>{content.wishes.sentText}</p>
    <Button variant="primary" fullWidth onClick={onDone}>
      {content.wishes.done}
    </Button>
  </div>
);

export const WishError = () => (
  <p className={styles.error} role="alert">
    {content.wishes.errorText}
    <a href={siteConfig.socials.telegram} target="_blank" rel="noopener noreferrer">
      {content.wishes.errorLink}
    </a>
  </p>
);
```

- [ ] **Step 4: Шторка**

Створи `src/features/wishes/components/WishSheet.tsx`:

```tsx
// src/features/wishes/components/WishSheet.tsx
// Шторка «Що нам ще розробити?» (спека 2026-09-17-wishes-chat-slot-design).
// Стани: idle → sending → sent | error. Уся реакція — всередині шторки,
// тостів нема. Єдина клієнтська перевірка — непорожній текст; решту лімітів
// тримає сервер. Закриття в будь-якому стані очищає форму: при наступному
// відкритті — знову idle (чернетки поза межами).
// Автофокусу на текстове поле нема: на телефоні він одразу підіймає
// клавіатуру і смикає шторку.
'use client';

import { FormEvent, useState } from 'react';
import { Sheet } from '@/shared/components/Sheet';
import { Input, TextareaField } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button/Button';
import { content } from '@/shared/config/content';
import { wishesApi } from '../api/wishes-api';
import { WishError, WishSent } from './WishSheetResult';
import styles from './WishSheet.module.scss';

interface WishSheetProps {
  opened: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 1000;
const CONTACT_MAX = 100;

export function WishSheet({ opened, onClose }: WishSheetProps) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [messageError, setMessageError] = useState<string | null>(null);

  const close = () => {
    setMessage('');
    setContact('');
    setWebsite('');
    setStatus('idle');
    setMessageError(null);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (text.length < MESSAGE_MIN) {
      setMessageError(content.wishes.messageError);
      return;
    }
    setMessageError(null);
    setStatus('sending');
    try {
      await wishesApi.sendWish({
        message: text,
        contact: contact.trim() || undefined,
        page: window.location.pathname,
        website,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const busy = status === 'sending';

  return (
    <Sheet opened={opened} onClose={close} title={content.wishes.title}>
      {status === 'sent' ? (
        <WishSent onDone={close} />
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <p className={styles.hint}>{content.wishes.hint}</p>
          <TextareaField
            label={content.wishes.messageLabel}
            placeholder={content.wishes.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            error={messageError}
            autosize
            minRows={3}
            maxRows={6}
            maxLength={MESSAGE_MAX}
            disabled={busy}
          />
          <Input
            label={content.wishes.contactLabel}
            placeholder={content.wishes.contactPlaceholder}
            value={contact}
            onChange={(e) => setContact(e.currentTarget.value)}
            maxLength={CONTACT_MAX}
            autoComplete="tel"
            disabled={busy}
          />
          {/* Honeypot: людина його не бачить (.sr-only з globals.css) і не
              дістає табом; бот заповнює — роут відповідає «успіх» і мовчить */}
          <input
            className="sr-only"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.currentTarget.value)}
          />
          <Button type="submit" variant="primary" fullWidth loading={busy}>
            {content.wishes.submit}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={close} disabled={busy}>
            {content.wishes.close}
          </Button>
          {status === 'error' && <WishError />}
        </form>
      )}
    </Sheet>
  );
}
```

Створи `src/features/wishes/index.ts`:

```ts
// src/features/wishes/index.ts
export { WishSheet } from './components/WishSheet';
export { wishesApi } from './api/wishes-api';
export type { WishRequest, WishResponse } from './api/wishes-api';
```

- [ ] **Step 5: Проводка в `Header.tsx`**

1. Після рядка `import { MenuSlot } from './MenuSlot';` додай:

```tsx
import { WishSheet } from '@/features/wishes';
```

2. Після рядка `const [panelW, setPanelW] = useState(0);` додай:

```tsx
// Шторка побажань: поки відкрита, такт слота меню/чат стоїть
const [wishesOpened, setWishesOpened] = useState(false);
```

3. Рядки

```tsx
{
  /* Слот меню/чат: paused і onOpenWishes отримують стан шторки в Task 5 */
}
<MenuSlot paused={false} onOpenWishes={() => undefined} />;
```

заміни на

```tsx
{
  /* Слот меню/чат: бургер і кнопка побажань по черзі, 5/5 с */
}
<MenuSlot paused={wishesOpened} onOpenWishes={() => setWishesOpened(true)} />;
```

4. Після `<CartDrawer />` додай:

```tsx
<WishSheet opened={wishesOpened} onClose={() => setWishesOpened(false)} />
```

- [ ] **Step 6: Типи і розміри файлів**

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

Run: `wc -l src/features/wishes/components/WishSheet.tsx src/widgets/Header/MenuSlot.tsx src/widgets/Header/useSlotAlternation.ts`
Expected: `WishSheet.tsx` ≤ 150, `MenuSlot.tsx` ≤ 70, `useSlotAlternation.ts` ≤ 80.

- [ ] **Step 7: Наскрізна перевірка (чекліст спеки, пункти 6–13)**

Run: `npm run dev`, Chrome, емуляція 390px, `http://localhost:3000/`.

1. Дочекайся кнопки чату, тапни.
   Expected: знизу виїжджає шторка з заголовком «Що нам ще розробити?», підписом, полем «Побажання» з плейсхолдером «Я би хотів, щоб ви розробили штани», полем «Телефон або Telegram», кнопками «Надіслати» і «Закрити». Хедер під оверлеєм не міняє кнопку, поки шторка відкрита.
2. Тапни «Надіслати» з порожнім полем.
   Expected: під полем «Побажання» червона лінія і «Напиши хоч кілька слів», запиту в Network нема.
3. Введи `тест шторки *_[]() — видалити`, контакт `@test`, «Надіслати».
   Expected: кнопка в стані завантаження, потім тіло шторки: «Дякуємо!», «Ми прочитаємо і подумаємо.», кнопка «Готово». В адмін-чаті — повідомлення з `Сторінка: https://www.ye-dril.com/`. «Готово» закриває шторку; у хедері одразу бургер «Меню», далі такт із нуля.
4. Відкрий знову: форма порожня (стан `idle`).
5. DevTools → Network → Offline. Введи текст, «Надіслати».
   Expected: під кнопками червоний рядок «Не надіслалось. Спробуй ще раз або напиши нам у Telegram», текст у полі зберігся, лінк веде на `https://t.me/makaron_gang?direct` у новій вкладці. Вимкни Offline, «Надіслати» ще раз → «Дякуємо!».
6. Закрий шторку тапом по оверлею, потім Escape із клавіатурою, потім «Закрити».
   Expected: усі три закривають; після кожного в хедері бургер.
7. Реальний телефон (LAN, `allowedDevOrigins` у `next.config.ts` має адресу Mac): шторка тягнеться за ручку і закривається свайпом униз; клавіатура не ламає розкладку (max-height 88vh).
8. Емуляція 1280px.
   Expected: слота нема, шторку відкрити нізвідки — це очікувано (спека, розділ «Десктоп»).

- [ ] **Step 8: Commit**

```bash
npx prettier --write src/features/wishes src/widgets/Header/Header.tsx
git add src/features/wishes src/widgets/Header/Header.tsx
git commit -m "feat(wishes): шторка «Що нам ще розробити?» — форма, стани, відправка в Telegram

Відкривається з кнопки чату в хедері; поки відкрита, такт слота стоїть.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 9: Прев'ю на Vercel (після пушу власником)**

Після пушу `v2` відкрий прев'ю-URL на телефоні, повтори пункти 1 і 3 із Step 7 з текстом `тест прев'ю — видалити`.
Expected: повідомлення доходить в адмін-чат (змінні `TELEGRAM_*` на Vercel ті самі, що читають наявні роути), `Сторінка:` вказує на `https://www.ye-dril.com/`.

---

## Самоперевірка плану (виконано при написанні)

- **Покриття спеки.** Слот, такт, утримання, пауза, прихована вкладка, blur і reduced-motion, `inert`, іконка — Task 1–2. Шторка, поля, валідація, чотири стани, копі — Task 5. Роут, honeypot, ліміти, плоский текст, київський час — Task 3–4. Десктоп без слота — Task 1 Step 6. Чекліст спеки: пункти 1–5 у Task 1–2, 6–13 у Task 5.
- **Плейсхолдери.** Єдиний навмисний тимчасовий рядок — фіксована фаза в `MenuSlot` (Task 1), яку Task 2 замінює; він позначений у коді.
- **Узгодженість імен.** `MenuSlot({ paused, onOpenWishes })`, `useSlotAlternation(paused) → { phase, holdHandlers }`, `SlotPhase`, `validateWish`/`formatWishMessage`/`WishInput`/`WishValidation`, `wishesApi.sendWish`/`WishRequest`/`WishResponse`, `WishSheet({ opened, onClose })`, `WishSent`/`WishError`, `content.wishes.*` — ті самі в усіх задачах.

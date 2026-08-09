# Motion-система в мові Дії — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Спека:** `docs/superpowers/specs/2026-08-09-diia-motion-system-design.md`

**Goal:** Дати сайту єдину систему руху в моториці застосунку Дія — швидку, послідовну й керовану з одного місця.

**Architecture:** Рух живе в CSS. Шар токенів у `globals.css` задає криві, тривалості й дистанції; міксини в `_motion.scss` прибирають дублювання; спільні примітиви (`Button`, `ListGroup`, `Card`, `Page`) розносять моторику по всіх сторінках без правок у самих сторінках. JS задіяний рівно в одному місці — жест шторки. Переходи сторінок — React `<ViewTransition>` поверх View Transitions API.

**Tech Stack:** Next.js 16.3.x (App Router), React 19, TypeScript, Mantine 8.3, SCSS-модулі. Нових залежностей не додається; дві наявні мертві — видаляються.

---

## Global Constraints

Ці правила діють у **кожному** завданні — не повторюються в кожному кроці.

- **Next ≥ 16.3.0.** До завдання 1 `<ViewTransition>` недоступний; не намагайся його імпортувати раніше.
- **Ніякого `transition: all`** у файлах, яких торкаєшся. Властивості перелічуються явно.
- **Тривалість руху ≤ 300 мс.** Винятки — тільки перехід сторінки (завдання 8–9) і `StatusPage` (завдання 15).
- **Кожен `:hover` — під `@media (hover: hover) and (pointer: fine)`.** На тачі `:hover` залипає після тапу.
- **Анімувати тільки `transform`, `opacity`, `filter`, `clip-path`** і кольорові властивості. Ніколи — `width`, `height`, `margin`, `padding`, `top/left`.
- **SCSS-аліасів `@/` у проєкті немає.** Імпорт партіалів — відносним шляхом: `@use '../../styles/motion' as motion;`. Аліас `@/` працює тільки в TS/TSX.
- **Mantine 8 без `@mantine/emotion`:** проп `styles` застосовується як inline-стилі, псевдоселектори там мовчки ігноруються. У темі — тільки `transitionProps` і статичні властивості. Стани — в `globals.css` або SCSS-модулях.
- **Правило єдиного джерела стилізації:** на одному елементі або Mantine-пропси, або SCSS-клас. Ніколи разом.
- **Коментарі в коді — українською**, як у решті проєкту. Пояснюй _чому_, а не _що_.
- **Ліміти:** компонент ≤ 150 рядків, функція ≤ 50 рядків.
- **Prettier:** 110 колонок, одинарні лапки, 2 пробіли, крапки з комою обовʼязкові.
- **`/admin` не чіпаємо.** Він успадкує лише ретаргет токенів із завдання 2.

### Два попередження про робоче середовище

1. **Гілку `v2` редагують паралельно.** `globals.css`, `DESIGN_SYSTEM.md`, `ProductCard.*` і `layout.tsx` змінюються поза цим планом. **Перед кожною правкою перечитуй файл** — номери рядків у цьому плані вказані на коміт `d988b55` і майже напевно зʼїхали.
2. **`.husky/pre-commit` виконує `npm run format` = `prettier --write .` по всьому репозиторію.** Будь-який комміт може причесати сторонні файли. Це очікувано; не відкочуй ці зміни і не додавай їх до свого комміту вручну — став у `git add` тільки свої файли.

### Feedback loop замість TDD

У проєкті **немає** тестового фреймворку: `package.json` містить лише `dev`, `build`, `start`, `lint`, `format`. Розгортати Jest/Playwright у межах цієї роботи ми не домовлялись, тому червоно-зелений сигнал дають:

- `npm run build` — типи й ESLint увімкнені в `next.config.ts` (`ignoreBuildErrors: false`), це головний гейт;
- `npm run lint`;
- **grep-перевірки** — фальсифіковані твердження про стан коду (напр. «у цьому файлі не лишилось `transition: all`»);
- **візуальний критерій приймання** — конкретний, перевірюваний оком, а не «має виглядати добре».

Кожне завдання закінчується всіма чотирма, де вони застосовні.

---

## Структура файлів

**Створюються:**

| Файл                                            | Відповідальність                                  |
| ----------------------------------------------- | ------------------------------------------------- |
| `src/shared/styles/_motion.scss`                | Міксини руху. Без значень — вони в `globals.css`. |
| `src/shared/components/AppLink/AppLink.tsx`     | `next/link` + напрямок переходу.                  |
| `src/shared/components/AppLink/index.ts`        | Реекспорт.                                        |
| `src/shared/components/Sheet/Sheet.tsx`         | Шторка: Mantine `Drawer.Root` + жест.             |
| `src/shared/components/Sheet/Sheet.module.scss` | Стилі шторки.                                     |
| `src/shared/components/Sheet/useSheetDrag.ts`   | Логіка жесту, відокремлена від розмітки.          |
| `src/shared/components/Sheet/index.ts`          | Реекспорт.                                        |

**Видаляється:** `src/shared/components/Skeleton/catalog/` — мертвий компонент із порожнім стилем (завдання 17).

**Змінюються:** `src/app/globals.css`, `src/app/LayoutWrapper.tsx` (якір хедера й футера — саме тут, а не в `layout.tsx`: `<Header>` рендериться звідси), `src/shared/config/mantine-theme.ts`, `src/shared/components/Page/Page.tsx`, `Button`, `ArrowCircle`, `Card`, `ListGroup`, `Input`, `Select`, `SearchInput`, `ProductCard`, `StatusPage`, `TelegramBottomNav`, `Header`, `LayoutWrapper`, `MobileFilterModal`, `CartDrawer`, `AuthDrawer`, `LoadingSkeleton`, `DESIGN_SYSTEM.md`, `package.json`.

---

# Завдання

## Завдання 1: Апгрейд Next до 16.3.x

Гейт перед усім іншим. Якщо не злітає — решта плану не має сенсу в поточному вигляді.

**Files:**

- Modify: `package.json`, `package-lock.json`
- Temp: `src/app/vt-smoke/page.tsx` (створюється і видаляється в межах завдання)

**Produces:** доступний `import { ViewTransition } from 'react'` у RSC.

- [ ] **Крок 1: Зафіксувати початковий стан**

```bash
node -p "require('next/package.json').version"
node -p "require('react/package.json').version"
```

Очікувано: `16.0.7` і `19.2.1`. Запиши їх — знадобляться для відкату.

- [ ] **Крок 2: Написати перевірку, яка зараз має впасти**

Створи `src/app/vt-smoke/page.tsx`:

```tsx
// ТИМЧАСОВИЙ файл. Перевіряє, що React у App Router віддає ViewTransition.
// Видаляється в кроці 7 цього ж завдання.
import { ViewTransition } from 'react';

export default function VtSmokePage() {
  return (
    <ViewTransition>
      <p>vt smoke</p>
    </ViewTransition>
  );
}
```

- [ ] **Крок 3: Переконатися, що перевірка падає**

```bash
npm run build
```

Очікувано: **FAIL** — `'"react"' has no exported member named 'ViewTransition'` або аналогічна помилка типів.

Якщо білд раптом **пройшов** — `<ViewTransition>` уже доступний, апгрейд не потрібен. Пропусти кроки 4–5, перейди до кроку 6 і зазнач це в комміті.

- [ ] **Крок 4: Оновити Next**

```bash
npm install next@^16.3.0 eslint-config-next@^16.3.0
```

- [ ] **Крок 5: Перевірити, що версія піднялась**

```bash
node -p "require('next/package.json').version"
```

Очікувано: `16.3.x` або вище.

- [ ] **Крок 6: Переконатися, що перевірка тепер проходить**

```bash
npm run build
```

Очікувано: **PASS**, маршрут `/vt-smoke` присутній у виводі білду.

Якщо все ще FAIL — **зупинись і доповідай**. Запасний варіант зі спеки: `experimental.viewTransition: true` в `next.config.ts`, але це опт-ін в експериментальну збірку React, і рішення про нього приймає власник проєкту, а не виконавець.

- [ ] **Крок 7: Прибрати тимчасовий файл і перевірити ще раз**

```bash
rm -rf src/app/vt-smoke
npm run build && npm run lint
```

Очікувано: обидві команди PASS, маршруту `/vt-smoke` у виводі більше немає.

- [ ] **Крок 8: Комміт**

```bash
git add package.json package-lock.json
git commit -m "chore(v2): Next 16.0.7 -> 16.3.x заради ViewTransition

React <ViewTransition> потрібен для переходів сторінок. У 16.0.7 він
доступний лише через experimental.viewTransition, що опт-інить застосунок
в експериментальну збірку React — для продакшн-магазину неприйнятно.
У 16.3 це підтримана фіча без прапорців."
```

---

## Завдання 2: Шар motion-токенів

**Files:**

- Modify: `src/app/globals.css`

**Produces:** CSS-змінні `--ease-out`, `--ease-in-out`, `--ease-sheet`, `--dur-press`, `--dur-hover`, `--dur-pop`, `--dur-modal`, `--dur-sheet`, `--dur-exit`, `--motion-rise`, `--motion-slide`, `--motion-press-scale`, `--stagger-step`; keyframe `motion-rise-in`.

- [ ] **Крок 1: Знайти наявний блок**

```bash
grep -n "transition-fast\|transition-normal\|transition-slow" src/app/globals.css
```

На коміті `d988b55` це рядки 363–365. **Файл редагують паралельно — довіряй виводу grep, а не цим номерам.**

- [ ] **Крок 2: Замінити три рядки на повний шар**

Замінюєш **тільки** три оголошення `--transition-*`, решту `:root` не чіпаєш:

```css
/* ============ Рух ============
     Криві розділені за призначенням. Раніше все анімувалось однією
     ease-in-out, яка стартує повільно — саме тому інтерфейс читався
     повільнішим за Дію при тих самих тривалостях. ease-out стартує
     миттєво й гальмує в кінці: рух видно рівно тоді, коли користувач
     дивиться найуважніше. */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);

--dur-press: 120ms;
--dur-hover: 160ms;
--dur-pop: 180ms;
--dur-modal: 220ms;
--dur-sheet: 300ms;
--dur-exit: 150ms;

--motion-rise: 8px;
--motion-slide: 60px;
--motion-press-scale: 0.97;
--stagger-step: 40ms;

/* @deprecated. Не мають property, тому розкриваються в `transition: all`
     і анімують заразом box-shadow, border-color та все інше.
     У новому коді пиши явно: `transition: background var(--dur-hover) var(--ease-out)`.
     Лишені з новою кривою, щоб полагодити моторику в 76 наявних місцях,
     не переписуючи 46 файлів одним комітом. */
--transition-fast: 150ms var(--ease-out);
--transition-normal: 200ms var(--ease-out);
--transition-slow: 300ms var(--ease-out);
```

- [ ] **Крок 3: Додати keyframe і reduced-motion у кінець файлу**

```css
@keyframes motion-rise-in {
  from {
    opacity: 0;
    transform: translateY(var(--motion-rise));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion — менше руху, а не нуль анімацій.
   Обнуляємо дистанції: рух зникає, а прозорість і колір лишаються, бо саме
   вони пояснюють користувачу, що елемент зʼявився або зник. Глухий
   `transition: none !important` прибрав би й це. */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-rise: 0px;
    --motion-slide: 0px;
    --motion-press-scale: 1;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Крок 4: Перевірити, що токени на місці**

```bash
grep -c "ease-out\|dur-press\|motion-rise\|motion-rise-in" src/app/globals.css
```

Очікувано: ≥ 8.

- [ ] **Крок 5: Білд і лінт**

```bash
npm run build && npm run lint
```

Очікувано: обидві PASS.

- [ ] **Крок 6: Візуальний критерій**

`npm run dev` → навести курсор на будь-яку кнопку в хедері. Зміна фону має **починатись миттєво** й гальмувати наприкінці. Порівняй відчуття з попереднім комітом: та сама тривалість, але сприймається швидше.

- [ ] **Крок 7: Комміт**

```bash
git add src/app/globals.css
git commit -m "feat(v2): шар motion-токенів, ретаргет застарілих --transition-*"
```

---

## Завдання 3: Міксини руху

**Files:**

- Create: `src/shared/styles/_motion.scss`

**Interfaces — Produces:**

- `@mixin press($scale: var(--motion-press-scale))` — тільки правило `:active`
- `@mixin pressable-transition` — готовий `transition` для натискних елементів
- `@mixin hoverable` — обгортка `@media`, приймає `@content`
- `@mixin stagger-child` — каскад через `--i`

> **Відхилення від спеки.** Спека перелічувала ще `enter-rise` (вхід через `@starting-style`). Жодне завдання плану його не використовує, тому він не заводиться: міксин без споживача — це мертвий код, який доведеться підтримувати. Знадобиться — додається одним рухом, keyframe `motion-rise-in` уже є.

- [ ] **Крок 1: Створити файл**

```scss
// src/shared/styles/_motion.scss
// Повторювані патерни руху. Значень тут немає — вони в globals.css (:root).
// SCSS-аліасів @/ у проєкті немає, імпорт відносний:
//   @use '../../styles/motion' as motion;

// Натискання. Дає миттєвий фідбек, що інтерфейс почув палець.
// scale() масштабує і дітей — іконка з текстом стискаються разом із кнопкою,
// як на контролах Дії.
//
// Міксин НЕ оголошує transition: інакше на одному селекторі виникло б два
// конкурентні оголошення. Викликач додає transform у свій transition сам —
// або через pressable-transition нижче.
@mixin press($scale: var(--motion-press-scale)) {
  &:active:not(:disabled) {
    transform: scale($scale);
  }
}

// Стандартний набір властивостей для натискного контролу.
// Натискання швидше за наведення: система має відповідати миттєво.
@mixin pressable-transition {
  transition:
    background var(--dur-hover) var(--ease-out),
    border-color var(--dur-hover) var(--ease-out),
    color var(--dur-hover) var(--ease-out),
    transform var(--dur-press) var(--ease-out);
}

// Hover тільки там, де є справжній курсор. На тачі :hover спрацьовує на тап
// і залипає — картка лишається піднятою, поки користувач не тапне деінде.
@mixin hoverable {
  @media (hover: hover) and (pointer: fine) {
    @content;
  }
}

// Каскад появи списку. --i (індекс елемента) ставиться інлайном із TSX і вже
// обрізаний там до 8: далі затримка робить низ довгого списку відчутно
// повільним, а каскад із декоративного стає перешкодою.
@mixin stagger-child {
  animation: motion-rise-in var(--dur-pop) var(--ease-out) both;
  animation-delay: calc(var(--i, 0) * var(--stagger-step));
}
```

> **Відхилення від спеки, свідоме.** Спека передбачала токен `--stagger-max: 8` і обрізання в CSS через `min()`. Dart Sass має власну функцію `min()` і намагається обчислити її на етапі компіляції, що з `var()` дає помилку. Обрізання перенесено в TSX (`Math.min(index, 8)`), токен `--stagger-max` не заводиться.

- [ ] **Крок 2: Перевірити, що SCSS компілюється**

Міксин без споживача Sass не компілює. Тимчасово підключи його в наявний модуль — додай першим рядком `src/shared/components/Button/button.module.scss`:

```scss
@use '../../styles/motion' as motion;
```

```bash
npm run build
```

Очікувано: PASS, без помилок Sass.

Рядок лишається — він знадобиться в завданні 4.

- [ ] **Крок 3: Комміт**

```bash
git add src/shared/styles/_motion.scss src/shared/components/Button/button.module.scss
git commit -m "feat(v2): міксини руху (_motion.scss)"
```

---

## Завдання 4: Ядро — контроли (Button, ArrowCircle)

**Files:**

- Modify: `src/shared/components/Button/button.module.scss`
- Modify: `src/shared/components/ArrowCircle/ArrowCircle.module.scss`

**Consumes:** міксини `press`, `pressable-transition`, `hoverable` із завдання 3.

- [ ] **Крок 1: Зафіксувати відсутність press-фідбеку**

```bash
grep -c ":active" src/shared/components/Button/button.module.scss src/shared/components/ArrowCircle/ArrowCircle.module.scss
```

Очікувано: `0` в обох. Це та відсутність, яку закриваємо.

- [ ] **Крок 2: Button — замінити transition і додати натискання**

У `.button` заміни рядок `transition: var(--transition-normal);` на:

```scss
@include motion.pressable-transition;
@include motion.press;
```

(`@use '../../styles/motion' as motion;` уже стоїть першим рядком із завдання 3.)

- [ ] **Крок 3: Button — загородити всі hover**

Кожен із чотирьох варіантів має `&:hover:not(:disabled)`. Загорни їх у `motion.hoverable`. Приклад для `primary`, решту — так само:

```scss
&--primary {
  background: var(--btn-primary);
  color: var(--text-inverse);

  @include motion.hoverable {
    &:hover:not(:disabled) {
      background: var(--btn-primary-hover);
    }
  }
}
```

- [ ] **Крок 4: ArrowCircle — те саме**

Повний вміст `.circle`:

```scss
@use '../../styles/motion' as motion;

.circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--btn-primary);
  color: var(--text-inverse);
  border-radius: var(--radius-pill);

  // Було `transition: var(--transition-fast)` — тобто `all`.
  @include motion.pressable-transition;
  @include motion.press;

  &--md {
    width: 44px;
    height: 44px;
  }

  &--sm {
    width: 32px;
    height: 32px;
  }
}
```

- [ ] **Крок 5: Перевірити, що `all` пішов, а `:active` зʼявився**

```bash
grep -n "transition: var(--transition-\|transition: all" src/shared/components/Button/button.module.scss src/shared/components/ArrowCircle/ArrowCircle.module.scss
```

Очікувано: **порожньо**.

```bash
grep -c "hoverable" src/shared/components/Button/button.module.scss
```

Очікувано: `4` (по одному на варіант).

- [ ] **Крок 6: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 7: Візуальний критерій**

- Десктоп: натиснути й **утримувати** кнопку — вона стискається до 97% і лишається стиснутою, поки не відпустиш.
- Мобільний (DevTools → device toolbar, або реальний телефон): тапнути кнопку й тапнути порожнє місце — кнопка **не** лишається в hover-стані.

- [ ] **Крок 8: Комміт**

```bash
git add src/shared/components/Button/button.module.scss src/shared/components/ArrowCircle/ArrowCircle.module.scss
git commit -m "feat(v2): press-фідбек і огорожа hover на кнопці та ArrowCircle"
```

---

## Завдання 5: Ядро — поверхні (Card, ListGroup, ProductCard)

**Files:**

- Modify: `src/shared/components/Card/Card.module.scss`
- Modify: `src/shared/components/ListGroup/ListGroup.module.scss`
- Modify: `src/features/catalog/components/ProductCard/ProductCard.module.scss`

- [ ] **Крок 1: Card**

Додай перший рядок `@use '../../styles/motion' as motion;`. У `.card` заміни `transition: var(--transition-fast);` на `@include motion.pressable-transition;` + `@include motion.press;` і загороди hover:

```scss
.card {
  height: 100%;
  background: var(--surface-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;

  @include motion.pressable-transition;
  @include motion.press;

  @include motion.hoverable {
    &:hover .productImage {
      transform: scale(1.02);
    }
  }
}
```

У `.productImage` заміни `transition: transform 0.3s ease;` на `transition: transform var(--dur-modal) var(--ease-out);`.

У `.title, .title2` заміни `transition: var(--transition-fast);` на `transition: color var(--dur-hover) var(--ease-out);` і загороди `&:hover` у `motion.hoverable`.

- [ ] **Крок 2: ListGroup**

Перший рядок — `@use '../../styles/motion' as motion;`.

У `.row` рядок `transition: background var(--transition-fast);` замінити на:

```scss
transition:
  background var(--dur-hover) var(--ease-out),
  transform var(--dur-press) var(--ease-out);
```

`.rowInteractive` повністю:

```scss
.rowInteractive {
  cursor: pointer;

  @include motion.press;

  @include motion.hoverable {
    &:hover {
      background: var(--background-secondary);
      color: var(--text-primary);
    }

    // Стрілка зсувається до краю — мікро-обіцянка «тут буде перехід».
    &:hover .arrow {
      background: var(--btn-primary-hover);
      transform: translateX(2px);
    }
  }
}
```

У `.arrow` додай `transition: transform var(--dur-hover) var(--ease-out);`.

- [ ] **Крок 3: ProductCard**

Перший рядок — `@use '../../../../shared/styles/motion' as motion;` (чотири рівні вгору — файл лежить у `features/catalog/components/ProductCard/`).

У `.card` заміни `transition: var(--transition-normal);` і hover-блок на:

```scss
transition:
  box-shadow var(--dur-hover) var(--ease-out),
  transform var(--dur-press) var(--ease-out);

@include motion.press;

// Підйом картки — тільки під курсором. На тачі він залипав після тапу
// й картка лишалась піднятою до наступного тапу деінде.
@include motion.hoverable {
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}
```

У `.productImage` заміни `transition: var(--transition-fast);` на `transition: transform var(--dur-hover) var(--ease-out);`.

У `.title` заміни `transition: var(--transition-fast);` на `transition: color var(--dur-hover) var(--ease-out);` і загороди `&:hover` у `motion.hoverable`.

У `.variantCheckboxText` заміни `transition: var(--transition-fast);` на:

```scss
transition:
  background var(--dur-hover) var(--ease-out),
  border-color var(--dur-hover) var(--ease-out),
  color var(--dur-hover) var(--ease-out),
  transform var(--dur-press) var(--ease-out);

@include motion.press;
```

і загороди його `&:hover` у `motion.hoverable`.

- [ ] **Крок 4: Прибрати дубль keyframe**

`ProductCard.module.scss` наприкінці оголошує власний `@keyframes blurFadeIn`, який **конфліктує** з однойменним у `shared/styles/_animations.scss` (різні значення). Клас `.loading` буде переписаний у завданні 14 — зараз просто прибери локальний `@keyframes blurFadeIn` з `ProductCard.module.scss` і додай першим рядком `@use '../../../../shared/styles/animations';`.

- [ ] **Крок 5: Перевірити**

```bash
grep -rn "transition: var(--transition-\|transition: all" src/shared/components/Card src/shared/components/ListGroup src/features/catalog/components/ProductCard
```

Очікувано: **порожньо**.

```bash
grep -c "@keyframes blurFadeIn" src/features/catalog/components/ProductCard/ProductCard.module.scss
```

Очікувано: `0`.

- [ ] **Крок 6: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 7: Візуальний критерій**

- Каталог, десктоп: картка товару під курсором піднімається на 2px; при натисканні — стискається.
- Каталог, мобільний: тап по картці **не** лишає її піднятою.
- Профіль або сторінка товару: рядок `ListGroup` під курсором змінює фон, а коло-стрілка зсувається праворуч на 2px.

- [ ] **Крок 8: Комміт**

```bash
git add src/shared/components/Card src/shared/components/ListGroup src/features/catalog/components/ProductCard
git commit -m "feat(v2): press-фідбек на поверхнях, огорожа hover, дубль blurFadeIn прибрано"
```

---

## Завдання 6: Ядро — поля вводу

**Files:**

- Modify: `src/shared/components/Input/Input.module.scss`
- Modify: `src/shared/components/Select/select.module.scss`
- Modify: `src/shared/components/SearchInput/SearchInput.module.scss`

- [ ] **Крок 1: Знайти всі `all` у трьох файлах**

```bash
grep -n "transition" src/shared/components/Input/Input.module.scss src/shared/components/Select/select.module.scss src/shared/components/SearchInput/SearchInput.module.scss
```

- [ ] **Крок 2: Замінити кожен знайдений**

Для полів анімуються рівно дві властивості — межа й кільце фокуса:

```scss
transition:
  border-color var(--dur-hover) var(--ease-out),
  box-shadow var(--dur-hover) var(--ease-out);
```

Якщо в конкретному правилі змінюється ще й фон — додай `background var(--dur-hover) var(--ease-out)`. Нічого зайвого не додавай: поле не має рухатись.

- [ ] **Крок 3: Перевірити**

```bash
grep -n "transition: var(--transition-\|transition: all" src/shared/components/Input src/shared/components/Select src/shared/components/SearchInput
```

Очікувано: **порожньо**.

- [ ] **Крок 4: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 5: Візуальний критерій**

Сторінка `/register`: перехід по полях клавішею Tab. Синя межа фокуса зʼявляється миттєво, поле **не** смикається й не змінює розмір.

- [ ] **Крок 6: Комміт**

```bash
git add src/shared/components/Input src/shared/components/Select src/shared/components/SearchInput
git commit -m "feat(v2): property-scoped переходи на полях вводу"
```

---

## Завдання 7: Дефолти переходів Mantine

Одна правка перекриває всі 22 файли з `Modal`/`Drawer`.

**Files:**

- Modify: `src/shared/config/mantine-theme.ts`

- [ ] **Крок 1: Додати `transitionProps` у наявний блок `components`**

Додай ці записи всередину `components: { ... }`, поряд із наявними. Наявні записи не чіпай.

```ts
    Modal: {
      // Наявний блок Modal уже є нижче — ДОДАЙ transitionProps у нього,
      // не створюй другий ключ Modal (об'єкт мовчки перезапише перший).
      defaultProps: {
        transitionProps: { transition: 'pop', duration: 220, timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      },
    },
    Drawer: {
      defaultProps: {
        transitionProps: { duration: 300, timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      },
    },
    Menu: {
      defaultProps: {
        transitionProps: { transition: 'pop', duration: 180, timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      },
    },
    Popover: {
      defaultProps: {
        transitionProps: { transition: 'pop', duration: 180, timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      },
    },
    Tooltip: {
      defaultProps: {
        transitionProps: { transition: 'fade', duration: 180, timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      },
    },
```

> **Чому `pop`, а не `scale`.** Mantine-івський `pop` масштабує від `transform-origin`, привʼязаного до тригера, — попап «виростає» з кнопки, що його відкрила. Модалка при цьому лишається центрованою: у неї немає тригера в просторі, і масштаб від краю виглядав би зламано.
>
> **Чому криві вписані числами, а не `var(--ease-out)`.** `timingFunction` іде в inline-стиль елемента, який Mantine рендерить у портал. `var()` там резолвиться, але значення дублюється в двох місцях — тому поряд лишається коментар із посиланням на токен.

- [ ] **Крок 2: Додати коментар над блоком**

```ts
// Дефолти переходів. Значення дублюють --ease-out / --ease-sheet із globals.css:
// Mantine кладе timingFunction в inline-стиль порталу, тому тримати їх
// одним джерелом без окремого рантайм-читання CSS-змінної не виходить.
// Міняєш криву в globals.css — поміняй і тут.
```

- [ ] **Крок 3: Перевірити, що ключ `Modal` не задубльовано**

```bash
grep -c "^    Modal:" src/shared/config/mantine-theme.ts
```

Очікувано: `1`. Якщо `2` — обʼєднай в один обʼєкт, інакше другий мовчки перезапише перший разом зі `styles`.

- [ ] **Крок 4: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 5: Візуальний критерій**

Відкрити кошик (`CartDrawer`) і мобільні фільтри. Шторка виїжджає по кривій `--ease-sheet`: швидкий старт, довге мʼяке гальмування — відчуття «важкої, але слухняної» панелі. Дропдаун сортування в каталозі виростає з кнопки, а не з центру.

- [ ] **Крок 6: Комміт**

```bash
git add src/shared/config/mantine-theme.ts
git commit -m "feat(v2): дефолти переходів Mantine під криві Дії"
```

---

## Завдання 8: Фундамент View Transitions + якір хедера

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/LayoutWrapper.tsx`

**Produces:** класи переходів `nav-forward` / `nav-back`, іменовані ділянки `site-header` / `site-footer`.

- [ ] **Крок 1: Додати CSS переходів у кінець `globals.css`**

```css
/* ============ Переходи сторінок ============
   Асиметрія навмисна: старий екран має піти швидко, щоб не конкурувати за
   увагу, новий — прийти мʼякше, щоб його встигли прочитати. Затримка на
   входженні дорівнює тривалості виходу: контент проявляється вже після
   того, як попередній зник. */

::view-transition-old(.nav-forward) {
  --slide-offset: -60px;

  animation:
    150ms ease-in both vt-fade reverse,
    400ms var(--ease-in-out) both vt-slide reverse;
}

::view-transition-new(.nav-forward) {
  --slide-offset: 60px;

  animation:
    210ms var(--ease-out) 150ms both vt-fade,
    400ms var(--ease-in-out) both vt-slide;
}

::view-transition-old(.nav-back) {
  --slide-offset: 60px;

  animation:
    150ms ease-in both vt-fade reverse,
    400ms var(--ease-in-out) both vt-slide reverse;
}

::view-transition-new(.nav-back) {
  --slide-offset: -60px;

  animation:
    210ms var(--ease-out) 150ms both vt-fade,
    400ms var(--ease-in-out) both vt-slide;
}

@keyframes vt-fade {
  from {
    opacity: 0;
    filter: blur(3px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes vt-slide {
  from {
    translate: var(--slide-offset);
  }

  to {
    translate: 0;
  }
}

/* Хедер і футер не їдуть разом із контентом. Без цього з екраном рухається
   вся шапка, і користувач втрачає єдину нерухому точку опори — у Дії
   навігація завжди лишається на місці. */
::view-transition-group(site-header),
::view-transition-group(site-footer) {
  animation: none;
  z-index: 100;
}

::view-transition-old(site-header),
::view-transition-old(site-footer) {
  display: none;
}

::view-transition-new(site-header),
::view-transition-new(site-footer) {
  animation: none;
}

/* Оверлей переходу перехоплює кліки — без цього тапи під час анімації
   просто губляться. */
::view-transition {
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

- [ ] **Крок 2: Іменувати хедер і футер**

У `src/app/LayoutWrapper.tsx` заміни блок повернення для не-Telegram сторінок:

```tsx
return (
  <>
    {/* viewTransitionName вилучає хедер зі знімка сторінки, щоб він не їхав
          разом із контентом. Правило анімації — в globals.css. */}
    <div style={{ viewTransitionName: 'site-header' }}>
      <Header />
    </div>
    <EmailVerificationBanner />
    <main>{children}</main>
    <div style={{ viewTransitionName: 'site-footer' }}>
      <Footer />
    </div>
  </>
);
```

> Inline-стиль тут відповідає варіанту C правил стилізації проєкту: `viewTransitionName` — унікальний ідентифікатор ділянки, а не оформлення, і в SCSS-модулі він жив би під згенерованим імʼям класу, до якого CSS-псевдоелемент не достукається.

- [ ] **Крок 3: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 4: Перевірка**

```bash
grep -c "view-transition" src/app/globals.css
```

Очікувано: ≥ 10.

Візуального ефекту поки **немає** — його вмикає завдання 9. Це очікувано.

- [ ] **Крок 5: Комміт**

```bash
git add src/app/globals.css src/app/LayoutWrapper.tsx
git commit -m "feat(v2): CSS-фундамент переходів сторінок + якір хедера й футера"
```

---

## Завдання 9: `<Page>` як носій переходу

**Files:**

- Modify: `src/shared/components/Page/Page.tsx`

**Consumes:** класи `nav-forward` / `nav-back` із завдання 8.

- [ ] **Крок 1: Переписати компонент**

```tsx
// src/shared/components/Page/Page.tsx
// Єдиний контейнер сторінки: одна максимальна ширина, одні горизонтальні поля.
// До цього кожна сторінка оголошувала власний `.container` без max-width, тож на
// широкому екрані контент розтягувався на всю ширину — мова Дії (одна колонка) ламалась.
import type { ElementType, ReactNode } from 'react';
import { ViewTransition } from 'react';
import clsx from 'clsx';
import styles from './Page.module.scss';

// Напрямок переходу приходить від <AppLink> через transitionTypes.
// default: 'none' обовʼязковий — без нього сторінка анімувалась би на будь-якому
// незвʼязаному переході, зокрема на розкритті Suspense і на router.refresh().
const NAV_ANIMATIONS = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'none',
} as const;

interface PageProps {
  children: ReactNode;
  className?: string;
  /** narrow — читабельна колонка для тексту (юридичні сторінки, форми) */
  width?: 'default' | 'narrow';
  as?: ElementType;
}

export const Page = ({ children, className, width = 'default', as: Tag = 'div' }: PageProps) => (
  // <ViewTransition> живе тут, а не в layout.tsx: лейаути переживають навігацію,
  // тому enter/exit у них ніколи не спрацьовують. <Page> рендериться з page.tsx
  // і розмонтовується при переході — саме те, що потрібно.
  <ViewTransition enter={NAV_ANIMATIONS} exit={NAV_ANIMATIONS} default="none">
    <Tag className={clsx(styles.page, styles[`page--${width}`], className)}>{children}</Tag>
  </ViewTransition>
);
```

- [ ] **Крок 2: Білд і лінт**

```bash
npm run build && npm run lint
```

Очікувано: PASS. Якщо помилка типів на `ViewTransition` — завдання 1 не завершене.

- [ ] **Крок 3: Візуальний критерій**

Ефекту все ще **немає**: `transitionTypes` ніхто не надсилає, тому спрацьовує `default: 'none'`. Перевір, що нічого не **зламалось** — сторінки відкриваються, верстка не поїхала. Рух зʼявиться в завданні 10.

- [ ] **Крок 4: Комміт**

```bash
git add src/shared/components/Page/Page.tsx
git commit -m "feat(v2): <ViewTransition> у <Page> — одна точка для всіх сторінок"
```

---

## Завдання 10: `<AppLink>` і розмітка напрямків

**Files:**

- Create: `src/shared/components/AppLink/AppLink.tsx`, `src/shared/components/AppLink/index.ts`
- Modify: `src/features/catalog/components/ProductCard/ProductCard.tsx`
- Modify: `src/shared/components/ListGroup/ListGroup.tsx`

**Produces:** `<AppLink href direction?>` — `direction` приймає `'forward' | 'back'`, за замовчуванням `'forward'`.

- [ ] **Крок 1: Створити компонент**

```tsx
// src/shared/components/AppLink/AppLink.tsx
// next/link + напрямок переходу. Тип переходу автоматично не визначається:
// браузер не знає, чи посилання веде «вглиб» застосунку, чи повертає назад.
// Напрямок кодує сенс — вперед екран заїжджає справа, назад їде вправо.
import type { ComponentProps } from 'react';
import Link from 'next/link';

type AppLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  children: React.ReactNode;
  /** back — для повернень: хлібні крихти, кнопки «до каталогу» */
  direction?: 'forward' | 'back';
};

export const AppLink = ({ direction = 'forward', ...props }: AppLinkProps) => (
  <Link {...props} transitionTypes={[direction === 'back' ? 'nav-back' : 'nav-forward']} />
);
```

```ts
// src/shared/components/AppLink/index.ts
export { AppLink } from './AppLink';
```

- [ ] **Крок 2: Перевірити, що `transitionTypes` існує в типах Link**

```bash
npm run build
```

Очікувано: PASS. Якщо TypeScript каже, що `transitionTypes` немає в пропсах `Link`, — версія Next нижча за потрібну; повернись до завдання 1.

- [ ] **Крок 3: Перевести картку товару**

У `ProductCard.tsx` заміни `import Link from 'next/link'` на `import { AppLink } from '@/shared/components/AppLink'` і всі `<Link ...>` на `<AppLink ...>`. Проп `direction` не вказуй — `forward` за замовчуванням.

- [ ] **Крок 4: Перевести рядок списку**

`ListRow` рендериться трьома способами залежно від пропсів: `<a>` для зовнішніх посилань, `<Link>` для внутрішніх, `<button>` для `onClick`. Переходу потребує **тільки** гілка з `<Link>` (на коміті `d988b55` — рядок 72):

```tsx
// було
<Link href={href} className={rowClass}>
  {body}
</Link>

// стало
<AppLink href={href} className={rowClass}>
  {body}
</AppLink>
```

Імпорт `Link from 'next/link'` замінюється на `import { AppLink } from '@/shared/components/AppLink';`. Гілки `<a>` (зовнішнє посилання — інший сайт) і `<button>` не чіпаємо.

- [ ] **Крок 5: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 6: Візуальний критерій — тут зʼявляється головний ефект**

Chrome, `npm run dev`, каталог → клік по картці товару:

- контент сторінки їде **вліво** й гасне;
- сторінка товару заїжджає **справа**;
- **хедер і футер стоять нерухомо**;
- клік по сторінці під час анімації не «провалюється».

Firefox і Safari: перехід може виглядати інакше або не програватись — це очікувано, застосунок працює нормально без анімації.

Якщо в цей момент рух здається **завільним** — так і буде: 400 мс зсуву взято з прикладів Next, а Дія відчутно швидша. Зменш `400ms` до `280ms` в обох `vt-slide` у `globals.css` і порівняй. Обери те, що ближче до Дії, і зафіксуй вибір у комміті.

- [ ] **Крок 7: Комміт**

```bash
git add src/shared/components/AppLink src/features/catalog/components/ProductCard/ProductCard.tsx src/shared/components/ListGroup/ListGroup.tsx src/app/globals.css
git commit -m "feat(v2): напрямлені переходи сторінок через <AppLink>"
```

---

## Завдання 11: Сторінки поза `<Page>`

П'ять сторінок не загорнуті в `<Page>`, тому переходу не отримують — і заразом порушують власне правило `DESIGN_SYSTEM.md`.

**Files:**

- Modify: `src/app/login/Login.tsx`, `src/app/orders/**`, `src/app/verify-email/VerifyEmail.tsx`, `src/app/forgot-password/**`, `src/app/resend-verification/**`

- [ ] **Крок 1: Знайти точний перелік**

```bash
grep -rLn "shared/components/Page" src/app/login src/app/orders src/app/verify-email src/app/forgot-password src/app/resend-verification --include=*.tsx
```

- [ ] **Крок 2: Загорнути кожну**

Для кожного файлу зі списку: заміни зовнішній контейнер (Mantine `<Container>` або власний `.container`) на `<Page>`. Форми й вузькі текстові сторінки беруть `width="narrow"`.

```tsx
import { Page } from '@/shared/components/Page/Page';

// було: <Container size="sm"> ... </Container>
// стало:
<Page width="narrow"> ... </Page>;
```

Якщо в сторінки був власний `max-width` або `padding` по горизонталі в SCSS-модулі — **прибери його**: поля тепер задає `<Page>`, інакше поле буде подвійним (`DESIGN_SYSTEM.md`).

- [ ] **Крок 3: Перевірити**

```bash
grep -rLn "shared/components/Page" src/app/login src/app/orders src/app/verify-email src/app/forgot-password src/app/resend-verification --include=*.tsx
```

Очікувано: **порожньо**.

- [ ] **Крок 4: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 5: Візуальний критерій**

Пройти по всіх пʼятьох сторінках. Ширина колонки й горизонтальні поля збігаються з `/register`. Подвійних відступів немає. Перехід із хедера на `/login` анімується.

- [ ] **Крок 6: Комміт**

```bash
git add src/app/login src/app/orders src/app/verify-email src/app/forgot-password src/app/resend-verification
git commit -m "fix(v2): пʼять сторінок переведено на <Page> — переходи й єдині поля"
```

---

## Завдання 12: Shared element — фото картки в фото товару

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCard.tsx`
- Modify: `src/app/catalog/[slug]/ProductDetailsClient.tsx`

- [ ] **Крок 1: Обгорнути фото в картці**

У `ProductCard.tsx` знайди `<Image>` головного фото й обгорни:

```tsx
import { ViewTransition } from 'react';

// name має збігатися з тим, що на сторінці товару, — по ньому React знаходить
// пару й анімує між їхніми позиціями. share="morph" разом із default="none"
// потрібні обидва: без default="none" це фото крос-фейдилось би на КОЖНОМУ
// переході на сторінці, а без share пара мовчки перестає морфитись.
<ViewTransition name={`product-${product.id}`} share="morph" default="none">
  <Image ... />
</ViewTransition>
```

- [ ] **Крок 2: Обгорнути фото на сторінці товару**

У `ProductDetailsClient.tsx` — те саме `name`, ті самі пропси, навколо головного фото галереї.

```bash
grep -n "product-\${" src/features/catalog/components/ProductCard/ProductCard.tsx src/app/catalog/\[slug\]/ProductDetailsClient.tsx
```

Очікувано: по одному збігу в кожному файлі, з **однаковим** шаблоном імені.

- [ ] **Крок 3: Додати CSS морфінгу в `globals.css`**

```css
/* Розмиття на середині морфінгу ховає артефакти інтерполяції пікселів:
   без нього видно, що це два різні зображення, які підмінили одне одного. */
::view-transition-group(.morph) {
  animation-duration: 320ms;
}

::view-transition-image-pair(.morph) {
  animation-name: vt-morph-blur;
}

@keyframes vt-morph-blur {
  30% {
    filter: blur(3px);
  }
}
```

- [ ] **Крок 4: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 5: Візуальний критерій**

Chrome: каталог → клік по картці. Фото товару **перетікає** зі своєї клітинки в позицію головного фото сторінки товару, а не зникає й зʼявляється. Назад — те саме в зворотному напрямку.

Якщо морфінг не грає: сторінка товару, найімовірніше, спершу показує Suspense-фолбек, і пара не утворюється. Це не поломка — переконайся, що картка префетчиться (наведи курсор на неї перед кліком) і перевір ще раз.

- [ ] **Крок 6: Комміт**

```bash
git add src/features/catalog/components/ProductCard/ProductCard.tsx "src/app/catalog/[slug]/ProductDetailsClient.tsx" src/app/globals.css
git commit -m "feat(v2): фото картки перетікає у фото сторінки товару"
```

---

## Завдання 13: `<Sheet>` — шторка з жестом

Найризикованіше завдання. Стоїть останнім серед структурних саме тому: якщо не злітає, решта системи не страждає.

**Files:**

- Create: `src/shared/components/Sheet/useSheetDrag.ts`, `Sheet.tsx`, `Sheet.module.scss`, `index.ts`
- Modify: `src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx`

**Produces:** `<Sheet opened onClose title? children>` — шторка знизу з ручкою та закриттям по жесту.

- [ ] **Крок 1: Логіка жесту окремим хуком**

```ts
// src/shared/components/Sheet/useSheetDrag.ts
// Жест «потягнути вниз, щоб закрити». Винесений із розмітки, бо це єдина
// частина шторки з власним станом і крайніми випадками.
import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

// Поріг швидкості (px/ms). Швидкий короткий кидок має закривати шторку так само,
// як повільне протягування через пів екрана: користувач висловив намір.
const VELOCITY_THRESHOLD = 0.11;
// Частка висоти шторки, після якої відпускання закриває її.
const DISTANCE_RATIO = 0.35;

export function useSheetDrag(onClose: () => void) {
  const [offset, setOffset] = useState(0);
  // isDragging — саме стан, а не читання ref: ref не викликає перерендер,
  // тому data-dragging (який вимикає transition) вішався б із запізненням
  // на кадр, і перший рух пальця йшов би через 300-мілісекундну анімацію.
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTime = useRef(0);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Другий дотик під час перетягування ігноруємо: інакше шторка
    // стрибне до позиції нового пальця.
    if (pointerId.current !== null) return;

    pointerId.current = e.pointerId;
    startY.current = e.clientY;
    startTime.current = e.timeStamp;
    setIsDragging(true);
    // Захоплюємо вказівник, щоб перетягування не обірвалось,
    // коли палець вийде за межі ручки.
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;

    const delta = e.clientY - startY.current;
    // Вгору тягнути можна, але з опором: різка стінка відчувається як поломка,
    // а сповільнення читається як межа.
    setOffset(delta < 0 ? delta / 4 : delta);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;

    const delta = e.clientY - startY.current;
    const elapsed = e.timeStamp - startTime.current;
    const velocity = elapsed > 0 ? delta / elapsed : 0;
    const height = e.currentTarget.closest('[data-sheet-content]')?.clientHeight ?? 0;

    pointerId.current = null;
    setIsDragging(false);
    setOffset(0);

    if (velocity > VELOCITY_THRESHOLD || delta > height * DISTANCE_RATIO) {
      onClose();
    }
  };

  return { offset, isDragging, onPointerDown, onPointerMove, onPointerUp };
}
```

- [ ] **Крок 2: Розмітка шторки**

```tsx
// src/shared/components/Sheet/Sheet.tsx
// Розподіл відповідальності: Mantine Drawer.Root тримає портал, focus trap,
// блокування скролу, aria й Escape; рух і жест ведемо самі. Власний перехід
// Mantine вимкнено (duration: 0) — інакше два трансформи билися б за один елемент.
'use client';

import type { ReactNode } from 'react';
import { Drawer } from '@mantine/core';
import { useSheetDrag } from './useSheetDrag';
import styles from './Sheet.module.scss';

interface SheetProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export const Sheet = ({ opened, onClose, title, children }: SheetProps) => {
  const drag = useSheetDrag(onClose);

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      transitionProps={{ duration: 0 }}>
      <Drawer.Overlay className={styles.overlay} data-opened={opened || undefined} />
      <Drawer.Content
        data-sheet-content
        className={styles.content}
        data-opened={opened || undefined}
        data-dragging={drag.isDragging || undefined}
        style={{ transform: `translateY(${drag.offset}px)` }}>
        <div
          className={styles.handleZone}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerUp}>
          <span className={styles.handle} />
        </div>
        {title && <Drawer.Title className={styles.title}>{title}</Drawer.Title>}
        <Drawer.Body className={styles.body}>{children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};
```

```ts
// src/shared/components/Sheet/index.ts
export { Sheet } from './Sheet';
```

> **Чому не framer-motion.** Спека передбачала його для жесту, але після декомпозиції виявилось, що потрібні лише pointer-події й один `translateY` — це 60 рядків без бібліотеки. Тягнути 35 kB заради цього не варто. `framer-motion` лишається невикористаним; рішення про його видалення — у завданні 17.

- [ ] **Крок 3: Стилі**

```scss
// src/shared/components/Sheet/Sheet.module.scss
.overlay {
  opacity: 0;
  transition: opacity var(--dur-sheet) var(--ease-sheet);

  &[data-opened] {
    opacity: 1;
  }
}

.content {
  border-top-left-radius: var(--radius-sheet);
  border-top-right-radius: var(--radius-sheet);
  transition: transform var(--dur-sheet) var(--ease-sheet);

  // Під час перетягування transform веде палець, а не анімація:
  // інакше шторка тягнулась би із запізненням у 300 мс.
  &[data-dragging] {
    transition: none;
  }
}

// Зона захоплення більша за саму ручку — 8px смужку пальцем не впіймати.
.handleZone {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  cursor: grab;
  touch-action: none;
}

.handle {
  width: 36px;
  height: 4px;
  background: var(--border-strong);
  border-radius: var(--radius-pill);
}

.title {
  padding: 0 var(--card-padding) var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--fw-medium);
}

.body {
  padding: 0 var(--card-padding) var(--card-padding);
}
```

- [ ] **Крок 4: Перевести мобільні фільтри**

У `MobileFilterModal.tsx` заміни `Drawer` на `Sheet` з `@/shared/components/Sheet`. Пропси `opened`, `onClose`, `title="Фільтри"` лишаються; `position` і `size` більше не потрібні — `Sheet` задає їх сам.

- [ ] **Крок 5: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 6: Візуальний критерій — обовʼязково на реальному телефоні**

DevTools для жестів не годиться: миша не відтворює інерцію пальця.

- Каталог, мобільний → «Фільтри»: шторка виїжджає знизу зі скругленим верхом і ручкою.
- Повільно потягнути ручку вниз на третину висоти й відпустити → закривається.
- Потягнути на 20px і відпустити → **повертається** на місце.
- Швидко «кинути» вниз на 30px → закривається (спрацював поріг швидкості).
- Потягнути **вгору** → йде з опором, а не впирається в стінку.
- Під час перетягування перехопити другим пальцем → шторка **не** стрибає.

Якщо будь-який пункт не виконується — **зупинись і доповідай**. Відкат зафіксовано в спеці: лишити `Sheet` без жесту (прибрати `useSheetDrag` і `handleZone`-обробники, лишити ручку й криву).

- [ ] **Крок 7: Комміт**

```bash
git add src/shared/components/Sheet src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx
git commit -m "feat(v2): <Sheet> — шторка з ручкою та закриттям по жесту"
```

---

## Завдання 14: Каскад списку й скелетон

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCard.tsx` (проп індексу)
- Modify: `src/app/catalog/CatalogClient.tsx` (передача індексу)
- Modify: `src/features/catalog/components/ProductCard/ProductCard.module.scss`
- Modify: `src/shared/styles/_animations.scss`
- Modify: `src/app/catalog/catalog.module.scss`, `src/widgets/PopularProductsSlider/PopularProductsSlider.module.scss`, `src/features/reviews/components/ReviewList/reviewList.module.scss` — три живі споживачі `skeletonPulse`

> **Не плутай із `shared/components/Skeleton/catalog/LoadingSkeleton`.** Його `.module.scss` — **порожній файл на 0 байт** (і в робочому дереві, і в HEAD), а сам компонент **ніхто не імпортує**. Тобто це мертвий код, який рендерив би невидимі `<div>`. Чіпати його тут не треба — він видаляється в завданні 17.

- [ ] **Крок 1: Передати індекс у картку**

У `CatalogClient.tsx` знайди `.map()` по товарах і додай індекс:

```tsx
{
  products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />);
}
```

- [ ] **Крок 2: Прийняти індекс у картці**

У `ProductCard.tsx` додай до пропсів `index?: number` і постав CSS-змінну на кореневий елемент картки:

```tsx
// Обрізаємо на 8: далі затримка робить низ довгого списку відчутно повільним,
// і каскад із декоративного стає перешкодою.
<div className={styles.card} style={{ '--i': Math.min(index ?? 0, 8) } as React.CSSProperties}>
```

- [ ] **Крок 3: Увімкнути каскад у стилях картки**

У `.card` додай `@include motion.stagger-child;` (міксин уже доступний із завдання 5).

- [ ] **Крок 4: Замінити скелетон на shimmer**

У `_animations.scss` **прибери** `skeletonPulse` і `blurFadeIn` (обидва анімують `filter: blur`, що змушує браузер перемальовувати кожен кадр) і додай:

```scss
// Shimmer через transform: рухається лише композитний шар, layout і paint
// не чіпаються. Попередній варіант анімував filter: blur на всю картку.
@keyframes skeletonShimmer {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}
```

- [ ] **Крок 4б: Перевести живих споживачів на shimmer**

```bash
grep -rn "skeletonPulse" src/
```

Для кожного знайденого правила заміни `animation: skeletonPulse ...` на псевдоелемент. Шаблон (назву класу бери з файлу, який правиш):

```scss
.<той-самий-клас > {
  position: relative;
  background: var(--background-secondary);
  overflow: hidden;

  // Смуга рухається transform-ом: працює на композитному шарі, layout і paint
  // не перераховуються. Попередній варіант анімував filter: blur на всьому
  // блоці — це перемальовування кожного кадру.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: skeletonShimmer 1.2s var(--ease-in-out) infinite;
  }
}
```

Якщо в блока вже є власний `::after` — використай `::before`; якщо зайняті обидва, додай порожній `<span className={styles.shimmer} />` усередину.

- [ ] **Крок 5: Перевірити, що старі анімації пішли**

```bash
grep -rn "skeletonPulse\|blurFadeIn" src/
```

Очікувано: **порожньо**. Якщо є збіги — це живі споживачі; переведи їх на `skeletonShimmer` або прибери клас.

- [ ] **Крок 6: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 7: Візуальний критерій**

- Каталог із холодного завантаження: картки проявляються каскадом згори вниз, приблизно по 40 мс одна за одною, і каскад зупиняється на девʼятій.
- Скелетон: світла смуга проходить зліва направо, картка при цьому **не** розмивається.
- У системних налаштуваннях увімкнути «зменшити рух» → перезавантажити: каскаду й shimmer немає, контент зʼявляється одразу.

- [ ] **Крок 8: Комміт**

```bash
git add src/features/catalog src/app/catalog src/widgets/PopularProductsSlider src/features/reviews/components/ReviewList src/shared/styles/_animations.scss
git commit -m "feat(v2): каскад карток каталогу, shimmer-скелетон замість blur"
```

---

## Завдання 15: Іконка `StatusPage`

Рідкісний екран — єдине місце в плані, де тривалість може перевищити 300 мс.

**Files:**

- Modify: `src/shared/components/StatusPage/StatusPage.module.scss`

- [ ] **Крок 1: Додати малювання контуру**

```scss
// Іконка малюється, а не зʼявляється. Це екран, який користувач бачить раз
// на замовлення — тут доречно витратити 600 мс на підтвердження результату.
// stroke-dasharray свідомо взято із запасом: точна довжина контуру залежить
// від конкретної іконки Tabler, а надлишок лише подовжує «хвіст» пунктиру.
.icon svg {
  stroke-dasharray: 120;
  stroke-dashoffset: 0;
  animation: status-draw 600ms var(--ease-out) both;
}

@keyframes status-draw {
  from {
    stroke-dashoffset: 120;
  }

  to {
    stroke-dashoffset: 0;
  }
}

// Картка підʼїжджає слідом, із затримкою: спершу результат, потім деталі.
.card {
  animation: motion-rise-in var(--dur-modal) var(--ease-out) 120ms both;
}
```

- [ ] **Крок 2: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 3: Візуальний критерій**

Відкрити `/not-found` (будь-який неіснуючий URL). Іконка **промальовується** контуром за ~0.6 с, картка підіймається слідом. Із увімкненим «зменшити рух» — зʼявляється одразу.

- [ ] **Крок 4: Комміт**

```bash
git add src/shared/components/StatusPage/StatusPage.module.scss
git commit -m "feat(v2): іконка StatusPage промальовується контуром"
```

---

## Завдання 16: Мікро-стани — нижня навігація й лічильник кошика

**Files:**

- Modify: `src/widgets/TelegramBottomNav/TelegramBottomNav.module.scss`
- Modify: `src/widgets/Header/header.module.scss`

- [ ] **Крок 1: Нижня навігація**

Перший рядок — `@use '../../shared/styles/motion' as motion;`.

У `.navItem` заміни `transition: var(--transition-fast);` на:

```scss
transition:
  background var(--dur-hover) var(--ease-out),
  color var(--dur-hover) var(--ease-out),
  transform var(--dur-press) var(--ease-out);
```

Наявний `&:active { transform: scale(0.95); }` заміни на `@include motion.press;` — щоб масштаб натискання був один на весь проєкт. Наявний `&:hover` загороди в `motion.hoverable`.

У `.label` і `.iconWrapper svg` заміни `transition: var(--transition-fast);` на `transition: color var(--dur-hover) var(--ease-out);`.

- [ ] **Крок 1б: Активна «пігулка» переїжджає, а не перефарбовується**

Зараз кожен із чотирьох пунктів має власний фон у `&.active` — при переході один згасає, інший загоряється. Око читає це як блимання. Один елемент, що **переміщується**, читається як той самий обʼєкт, що перейшов на нове місце.

У `TelegramBottomNav.tsx` порахуй активний індекс і віддай його в CSS (`navItems` оголошено на рядку 54, їх рівно чотири):

```tsx
const activeIndex = navItems.findIndex((item) => isActive(item.href));

// ...
<nav
  className={styles.navContainer}
  data-has-active={activeIndex >= 0 || undefined}
  style={
    { '--active-index': Math.max(activeIndex, 0), '--nav-count': navItems.length } as React.CSSProperties
  }>
```

У `TelegramBottomNav.module.scss` заміни `.navContainer` цілком:

```scss
.navContainer {
  position: relative;
  // Grid замість space-around: пігулці потрібні колонки однакової ширини,
  // інакше зсув на 100% не збігається з позицією пункту.
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-xs);

  &::before {
    content: '';
    position: absolute;
    top: var(--spacing-sm);
    bottom: var(--spacing-sm);
    left: var(--spacing-xs);
    width: calc((100% - var(--spacing-xs) * 2) / var(--nav-count, 4));
    background: var(--background-secondary);
    border-radius: var(--radius-pill);
    transform: translateX(calc(var(--active-index, 0) * 100%));
    opacity: 0;
    pointer-events: none;
    transition:
      transform var(--dur-modal) var(--ease-in-out),
      opacity var(--dur-hover) var(--ease-out);
  }

  // Поки жоден пункт не активний, пігулки немає — інакше вона стрибала б
  // із нульової позиції при першому ж переході.
  &[data-has-active]::before {
    opacity: 1;
  }
}
```

У `.navItem` додай `z-index: 1;` (щоб вміст лежав над пігулкою) і **прибери** `background: var(--background-secondary);` з блоку `&.active` — фон тепер малює пігулка. Колір тексту й вагу в `&.active` лиши.

> **Відхилення від спеки.** Спека називала `clip-path`. Техніка з `clip-path` існує для іншої задачі — коли треба переганяти **колір тексту** через дубльований шар. Тут активний пункт міняє і фон, і колір, і вагу, тому зсув одного шару простіший і дає той самий ефект. Чіпи варіантів товару (`variantCheckboxText`) пігулки не отримують: вони переносяться на новий рядок (`flex-wrap`), і пігулка, що стрибає між рядками, читається як дефект. Там лишається швидкий перехід фону з завдання 5.

- [ ] **Крок 2: Лічильник кошика**

У `header.module.scss`, у `.cartIconBadge`:

```scss
// Лічильник смикається при зміні — інакше додавання товару з каталогу
// проходить непоміченим: число змінюється поза полем зору користувача.
.cartIconBadge {
  animation: badge-pop var(--dur-pop) var(--ease-out);
}

@keyframes badge-pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}
```

Щоб анімація повторювалась при кожній зміні, а не лише при монтуванні, у `Header.tsx` додай `key` до бейджа — React перемонтує вузол, і анімація програється знову. На коміті `d988b55` бейдж лежить на рядку 306:

```tsx
// було
<Badge size="sm" circle className={styles.cartIconBadge}>
  {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
</Badge>

// стало
<Badge size="sm" circle className={styles.cartIconBadge} key={calculations.itemsCount}>
  {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
</Badge>
```

- [ ] **Крок 3: Білд і лінт**

```bash
npm run build && npm run lint
```

- [ ] **Крок 4: Візуальний критерій**

- Telegram-версія (`/telegram`): тап по пункту навігації стискає його до 97%.
- Перехід між пунктами: пігулка **переїжджає** з одного пункту на інший одним рухом. Ніде не має бути моменту, коли видно дві пігулки або жодної.
- Перше відкриття `/telegram/catalog`: пігулка зʼявляється одразу під «Каталогом», а не приїжджає зліва.
- Каталог: додати товар у кошик → лічильник у хедері **смикається**. Додати ще один → смикається знову.

- [ ] **Крок 5: Комміт**

```bash
git add src/widgets/TelegramBottomNav src/widgets/Header
git commit -m "feat(v2): press у нижній навігації, pop лічильника кошика"
```

---

## Завдання 17: Прибирання й документація

**Files:**

- Modify: `package.json`
- Modify: `DESIGN_SYSTEM.md`

- [ ] **Крок 1: Підтвердити, що залежності мертві**

```bash
grep -rn "react-hot-toast" src/
grep -rn "framer-motion" src/
```

Очікувано: **порожньо в обох**. Якщо `framer-motion` десь зʼявився — залиш його й прибери тільки `react-hot-toast`.

- [ ] **Крок 2: Прибрати**

```bash
npm uninstall react-hot-toast framer-motion
npm run build
```

Очікувано: PASS.

- [ ] **Крок 2б: Прибрати мертвий скелетон каталогу**

`src/shared/components/Skeleton/catalog/LoadingSkeleton.tsx` посилається на ~20 класів зі свого `.module.scss`, який має **0 байт**. Тобто компонент рендерив би невидимі `<div>`. Імпортів у нього немає.

```bash
grep -rn "LoadingSkeleton" src/ --include=*.tsx | grep -v "Skeleton/catalog"
```

Очікувано: **порожньо**. Якщо є споживач — **зупинись і доповідай**: тоді це не мертвий код, а зламаний, і його треба лагодити, а не видаляти.

```bash
git rm -r src/shared/components/Skeleton/catalog
npm run build
```

Очікувано: PASS.

- [ ] **Крок 3: Дописати розділ у `DESIGN_SYSTEM.md`**

**Перечитай файл перед правкою — його редагують паралельно.** Додай новий розділ після «📐 Розміри контролів»:

````markdown
## 🎬 Рух

Мова руху Дії — **швидка й пружна, без відскоку**. Помилка, яку легко зробити:
розтягнути анімацію до 400 мс «щоб було красиво». Тоді вона одразу перестає
бути Дією.

**Криві розділені за призначенням.** Раніше все анімувалось однією `ease-in-out`,
яка стартує повільно — саме тому інтерфейс читався повільнішим, ніж був.

```
--ease-out     cubic-bezier(0.23, 1, 0.32, 1)     входи, появи, відпускання пальця
--ease-in-out  cubic-bezier(0.77, 0, 0.175, 1)    рух і морфінг на екрані
--ease-sheet   cubic-bezier(0.32, 0.72, 0, 1)     шторки
```

**Тривалості.** У UI — не більше 300 мс. Винятки: перехід сторінки й `StatusPage`.

```
--dur-press 120   --dur-hover 160   --dur-pop 180
--dur-modal 220   --dur-sheet 300   --dur-exit 150
```

`--dur-exit` менший за вхід навмисно: старе має піти швидко, щоб не конкурувати
за увагу, нове — прийти мʼякше.

**Дистанції:** `--motion-rise` (8px), `--motion-slide` (60px),
`--motion-press-scale` (0.97), `--stagger-step` (40ms).

### Правила

- **`transition: all` — заборонено.** Перелічуй властивості явно.
- **Анімуємо тільки** `transform`, `opacity`, `filter`, `clip-path` і кольори.
  Ніколи — `width`, `height`, `margin`, `padding`, `top/left`.
- **Кожен `:hover` — під `@media (hover: hover) and (pointer: fine)`**
  (міксин `motion.hoverable`). На тачі `:hover` спрацьовує на тап і залипає.
- **Усе натискне має `:active`** зі `scale(0.97)` (міксин `motion.press`).
- **Дії з клавіатури не анімуємо** — вони повторюються сотні разів на день.
- **Каскад обрізаємо на 8-му елементі**, інакше низ довгого списку чекає.

### Міксини

`src/shared/styles/_motion.scss`. SCSS-аліасів `@/` у проєкті немає — імпорт
відносний: `@use '../../styles/motion' as motion;`

| Міксин                  | Для чого                                     |
| ----------------------- | -------------------------------------------- |
| `press($scale)`         | правило `:active`                            |
| `pressable-transition`  | готовий `transition` для натискного контролу |
| `hoverable`             | обгортка `@media`, приймає `@content`        |
| `enter-rise($duration)` | вхід через `@starting-style`                 |
| `stagger-child`         | каскад через `--i`                           |

### Переходи сторінок

`<ViewTransition>` живе в `shared/components/Page` — **не** в `layout.tsx`:
лейаути переживають навігацію, тому `enter`/`exit` у них не спрацьовують.
Напрямок задає `<AppLink direction="forward|back">`. Хедер і футер прибиті
через `viewTransitionName` — вони не їдуть разом із контентом.

Нова сторінка отримує перехід автоматично, якщо загорнута в `<Page>`.

### Застаріле

`--transition-fast/normal/slow` розкриваються в `transition: all`. Лишені з
новою кривою заради 76 наявних місць. **У новому коді не використовуй.**
````

- [ ] **Крок 4: Оновити чеклист нового компонента**

Додай у кінець списку «✅ Чеклист нового компонента»:

```markdown
- [ ] `transition` перелічує властивості явно, без `all`
- [ ] Натискні елементи мають `:active` (`motion.press`)
- [ ] Усі `:hover` — під `motion.hoverable`
- [ ] Анімації ≤ 300 мс (крім переходу сторінки й StatusPage)
```

- [ ] **Крок 5: Фінальна перевірка всього**

```bash
npm run build && npm run lint
grep -rn "transition: all" src/ || echo "OK: transition: all нема"
```

- [ ] **Крок 6: Комміт**

```bash
git add package.json package-lock.json DESIGN_SYSTEM.md
git commit -m "docs(v2): розділ «Рух» у дизайн-системі; прибрано мертві залежності"
```

---

## Фінальна приймальна перевірка

Пройти після завдання 17. Кожен пункт — одне з восьми, що замовлялось.

| #   | Патерн                | Де перевіряти                          | Критерій                                                       |
| --- | --------------------- | -------------------------------------- | -------------------------------------------------------------- |
| 1   | Push-перехід сторінок | каталог → товар, Chrome                | старий екран їде вліво, новий заїжджає справа, хедер нерухомий |
| 2   | Press-фідбек          | будь-яка кнопка, картка, рядок списку  | стискається до 97% під пальцем                                 |
| 3   | Bottom sheet          | фільтри каталогу, **реальний телефон** | тягнеться пальцем, закривається кидком, вгору йде з опором     |
| 4   | Каскад списків        | каталог із холодного завантаження      | картки проявляються по черзі, каскад стає на 9-й               |
| 5   | Статус-екрани         | `/not-found`                           | іконка промальовується контуром                                |
| 6   | Табки й чіпи          | нижня навігація `/telegram`            | пігулка переїжджає одним рухом, не блимає                      |
| 7   | Скелетони             | каталог під час завантаження           | shimmer іде зліва направо, без розмиття                        |
| 8   | Мікро-стани           | додати товар у кошик                   | лічильник у хедері смикається                                  |

**Наскрізні:**

- [ ] Системне «зменшити рух» → рух зникає, прозорість лишається
- [ ] На тачі жоден елемент не залипає в hover після тапу
- [ ] `npm run build` і `npm run lint` — обидва зелені
- [ ] `grep -rn "transition: all" src/` — порожньо
- [ ] Firefox і Safari: перехід сторінки може не грати — застосунок при цьому працює нормально

---

## Відомі межі

- **`/admin` не входить** — успадкував лише ретаргет токенів із завдання 2.
- **`/telegram/*`** переходів сторінок не отримує: свій layout без хедера й футера, всередині WebView у навігації власна моторика.
- **Значення переходу сторінки** (400 мс зсуву) взято з прикладів Next і майже напевно завеликі для Дії. Крок 6 завдання 10 передбачає їх зменшення до 280 мс — рішення приймається оком, а не планом.
- **Чіпи варіантів товару пігулки не отримують.** Вони переносяться на новий рядок (`flex-wrap`), і пігулка, що стрибає між рядками, читається як дефект. Там лишається швидкий перехід фону (завдання 5).
- **`framer-motion` не знадобився.** Спека закладала його під жест шторки; після декомпозиції виявилось, що вистачає pointer-подій і одного `translateY` — це 60 рядків. Залежність видаляється в завданні 17 разом із `react-hot-toast`.
- **Тестового покриття немає.** Гейт — білд, лінт, grep і око. Варто окремо налаштувати Feedback Loop через `/feedback-loop`.

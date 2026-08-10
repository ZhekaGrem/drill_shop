# Градієнтний hover кнопок у стилі Дії

**Дата:** 2026-08-11
**Гілка:** v2
**Статус:** дизайн затверджено, готово до планування

---

## Проблема

Кнопки проєкту мають пласкі hover-стани. Потрібен ефект як на `diia.gov.ua/news`
(кнопка «Більше новин»): при наведенні чорна кнопка розкривається кольоровим
градієнтом, і градієнт щоразу інший.

У `button.module.scss` уже є спроба цього ефекту для `--primary`: один шар
`--gradient-brand` під чорною маскою `::before` з `background-position` drift 12s.
Механіка правильна, але градієнт **один пастельний шар** із `background-size: 200% 200%` —
зсув позиції по одному лінійному градієнту дає ледь помітну різницю кольору,
тож «щоразу інше» на око не читається. Це і є реальний дефект.

## Референс: що насправді робить Дія

Витягнуто з бойового CSS (`https://diia.gov.ua/combine/44261ff286f3cd30e7cdd7bb96061748-1780474218`):

```css
.btn_more-news {
  border-radius: 40px; padding: 16px 25px; color: #fff;
  position: relative; z-index: 1;
}
@media (min-width: 768px) {
  .btn_more-news {
    transition: 0.2s ease-in-out;
    background-image:
      linear-gradient(217deg, rgba(255,0,0,0.8), rgba(255,0,0,0) 70.71%),
      linear-gradient(127deg, rgba(0,0,255,0.8), rgba(0,0,255,0) 70.71%),
      linear-gradient(336deg, rgba(0,255,0,0.8), rgba(0,255,0,0) 70.71%);
    background-size: 200% 300%;
    animation: 10s infinite granimate;
  }
}
.btn_more-news::before {
  content: ""; position: absolute; left:-1px; right:-1px; top:-1px; bottom:-1px;
  margin: auto; z-index: -1; border-radius: 40px;
  background-color: #000; opacity: 1; visibility: visible;
  transition: 0.2s ease-in-out;
}
@media (min-width: 768px) {
  .btn_more-news:hover        { color: #000; background-color: transparent; }
  .btn_more-news:hover::before{ opacity: 0; visibility: hidden; }
}
.btn_more-news:disabled::before { background-color: #ccc; }

@keyframes granimate {
  0%, 100% { background-position: 0 25%; }
  25%, 75% { background-position: 50% 50%; }
  50%      { background-position: 100% 100%; }
}
```

**Градієнт у Дії не рандомний.** Три накладені півпрозорі шари під різними кутами
безперервно рухаються 10-секундним циклом під чорною маскою. Hover лише прибирає
маску — і оскільки анімація ніколи не зупиняється, кожне наведення ловить інший
кадр. Ефект «рандому» без жодного JS.

На екранах < 768px градієнта немає взагалі — кнопка просто чорна.

## Обрані рішення

**Механіка (варіант C, «гібрид»):** схема Дії + рандомний старт кадру.
На `mouseenter` елементу виставляється негативний `animation-delay`
(`-Math.random() * 10s`), тобто анімація миттєво перестрибує у випадкову точку
циклу і пливе далі. Це усуває єдину слабкість чистого підходу Дії — два наведення
підряд за секунду дають майже однаковий кадр.

**Охоплення (варіант 2):** `shared/components/Button` (variant `primary`) +
Mantine-кнопки `variant="filled"`, з ручним opt-out через `data-plain` на
деструктивних кнопках.

Відхилено:
- чистий CSS без JS — «рандом» неповний (див. вище);
- випадковий вибір із набору пресет-градієнтів на JS — більше коду, різкіші
  стрибки кольору, і через тему Mantine обробники подій не навісиш.

## Реалізація

### Токени — `src/app/globals.css`

Окремий набір саме для кнопок; `--gradient-brand` / `--gradient-page` не чіпаємо.

```css
--gradient-btn:
  linear-gradient(217deg, rgba(75, 139, 250, 0.85), rgba(75, 139, 250, 0) 70.71%),
  linear-gradient(127deg, rgba(153, 238, 204, 0.85), rgba(153, 238, 204, 0) 70.71%),
  linear-gradient(336deg, rgba(195, 170, 178, 0.85), rgba(195, 170, 178, 0) 70.71%);
--gradient-btn-size: 200% 300%;
--gradient-btn-cycle: 10s;
```

Кольори — з брендової палітри (`#4b8bfa`, `#99eecc`, `#c3aab2`), не чисті RGB як у Дії.
Кути та точка згасання `70.71%` збережені з референсу.

Плюс глобальні `@keyframes granimate` (стопи як у Дії) — оголошені один раз,
щоб їх бачили і CSS-модуль кнопки, і правило для Mantine.

### `shared/components/Button`

`button.module.scss`, variant `--primary`:

```scss
&--primary {
  position: relative;
  isolation: isolate;
  background: var(--btn-primary);
  color: var(--text-inverse);
  transition: color 0.2s ease-in-out;

  @media (hover: hover) and (pointer: fine) {
    background-color: transparent;
    background-image: var(--gradient-btn);
    background-size: var(--gradient-btn-size);
    animation: granimate var(--gradient-btn-cycle) infinite;

    &::before {
      content: '';
      position: absolute;
      inset: -1px;
      z-index: -1;
      border-radius: inherit;
      background: var(--btn-primary);
      transition: opacity 0.2s ease-in-out;
    }

    &:hover:not(:disabled),
    &:focus-visible { color: var(--text-primary); }

    &:hover:not(:disabled)::before,
    &:focus-visible::before { opacity: 0; }
  }
}
```

Замість медіа-запиту по ширині (як у Дії) використано `(hover: hover) and (pointer: fine)`:
планшет на 1024px із тачем не отримає ефект, який він не може показати.

Варіанти `secondary`, `outline`, `ghost` лишаються без змін.

`Button.tsx`: додати `data-gradient-btn={variant === 'primary' || undefined}`.

### Mantine-кнопки

`mantine-theme.ts`: `Button: { defaultProps: { variant: 'filled' } }`.

Візуально не змінює нічого (`filled` і так дефолт у `varsResolver`), але гарантує
наявність атрибута `data-variant="filled"` на DOM-вузлі. Без цього дефолтні кнопки
атрибута не мають взагалі і селектор довелося б дублювати.

`globals.css`:

```css
@media (hover: hover) and (pointer: fine) {
  .mantine-Button-root[data-variant='filled']:not([data-plain]) { /* та сама схема */ }
}
```

Специфічність `0,3,0` перекриває власне hover-правило Mantine (`0,2,0`),
тому `background-color: var(--button-hover)` не заб'є градієнт.

`shared/Button` рендериться з `unstyled`, тому класу `.mantine-Button-root`
не отримує — два правила не конфліктують.

### Opt-out

`data-plain` на деструктивних filled-кнопках. За поточним кодом це
`src/app/admin/reviews/AdminReviews.tsx:382` («Видалити», `color="red"`).
Під час реалізації пройти всі 11 файлів, що імпортують `Button` з `@mantine/core`,
і додати атрибут де ефект недоречний.

`variant="light"` (уся адмінська пагінація) під селектор не потрапляє автоматично.

**Обмеження:** Mantine 8 не виводить `color` в DOM-атрибут — лише в inline
CSS-змінну `--button-bg`. Тому відрізнити `color="red"` селектором неможливо,
opt-out тільки ручний.

### Рандомний кадр — `src/shared/hooks/useRandomGradientPhase.ts`

```ts
'use client';

const CYCLE = 10;
const SELECTOR =
  '[data-gradient-btn], .mantine-Button-root[data-variant="filled"]:not([data-plain])';

export function useRandomGradientPhase() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onOver = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>(SELECTOR);
      if (!btn) return;
      const from = e.relatedTarget as Node | null;
      if (from && btn.contains(from)) return;
      btn.style.animationDelay = `-${Math.random() * CYCLE}s`;
    };

    document.addEventListener('mouseover', onOver);
    return () => document.removeEventListener('mouseover', onOver);
  }, []);
}
```

Делегований слухач на `document` замість обробника на кожній кнопці: працює і для
кнопок, що з'явилися після рендеру (модалки, пагінація, підвантажені списки).

Перевірка `btn.contains(e.relatedTarget)` відсікає рух курсору між дочірніми
вузлами кнопки (label / icon section) — без неї анімація смикалася б посеред hover.

`Math.random()` викликається **тільки** всередині обробника події, ніколи під час
рендеру — тому hydration mismatch неможливий.

Викликається один раз у `LayoutWrapper.tsx` (уже `'use client'`), **до** раннього
`return` для `/telegram` — і щоб не порушити правила хуків, і щоб telegram-сторінки
теж отримали ефект.

Експортується через `src/shared/hooks/index.ts` за наявною конвенцією.

## Доступність

- **Контраст:** на hover текст стає `--text-primary`. Найтемніша точка градієнта —
  `#4b8bfa`; чорний текст на ньому дає ≈6.4:1 при потрібних 4.5:1 (WCAG 1.4.3 AA).
- **`prefers-reduced-motion: reduce`:** `animation: none`; hover показує статичний
  кадр градієнта, JS-рандомізація не вмикається взагалі.
- **`:focus-visible`** дає той самий reveal, що й hover — клавіатурні користувачі
  не втрачають зворотний зв'язок.
- **`:disabled`** — маска лишається на місці, ефекту немає.
- **Тач-пристрої** (`hover: none`) — кнопка суцільно чорна, анімація не запускається.

## Файли

| Файл | Зміна |
|---|---|
| `src/app/globals.css` | токени `--gradient-btn*`, `@keyframes granimate`, правило для Mantine |
| `src/shared/components/Button/button.module.scss` | переписаний `&--primary` |
| `src/shared/components/Button/Button.tsx` | атрибут `data-gradient-btn` |
| `src/shared/config/mantine-theme.ts` | `Button.defaultProps.variant = 'filled'` |
| `src/shared/hooks/useRandomGradientPhase.ts` | новий файл |
| `src/shared/hooks/index.ts` | експорт хука |
| `src/app/LayoutWrapper.tsx` | виклик хука |
| `src/app/admin/reviews/AdminReviews.tsx` та інші | `data-plain` на деструктивних кнопках |

## Ризик, який перевіряється першим

Чи не перейменує css-loader `animation: granimate` усередині CSS-модуля, якщо самі
keyframes оголошені в `globals.css`. Очікування: імена, не визначені локально,
проходять без змін. Якщо ефект не запуститься — продублювати `@keyframes` усередині
модуля. Видно одразу після `npm run dev`.

## Перевірка

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`
4. Візуально на dev-сервері:
   - 5–6 наведень підряд на одну кнопку — кольори помітно різні щоразу;
   - рух курсору всередині кнопки не перезапускає анімацію;
   - емуляція тач-пристрою — градієнта немає, кнопка чорна;
   - `prefers-reduced-motion: reduce` — анімації немає;
   - адмінка: «Видалити» лишається червоною, пагінація (`variant="light"`) без градієнта;
   - Tab-навігація — `:focus-visible` розкриває градієнт.

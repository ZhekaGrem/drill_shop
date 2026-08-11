# «Підвішена маса» — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** інертний idle-рух футболки — нерівномірний оберт із «диханням» швидкості, маятникові нахили, вертикальний дрейф і шейдерне відставання тканини від прискорень.

**Architecture:** новий хук `useIdleMotion` інтегрує кутову швидкість по кадрах (стан у refs), мутує transform зовнішньої групи і повертає згладжений lag; `useWind` отримує другий uniform `uWindLag` і тангенційний доданок у chunk (напрям спільний для обох шарів тканини — проколи неможливі); `TshirtScene` замінює ручний рядок ротації на idle-крок.

**Tech Stack:** React Three Fiber 9, three (GLSL-патч). Нових залежностей немає.

**Спека:** `docs/superpowers/specs/2026-08-11-tshirt-idle-mass-design.md`

## Global Constraints

- Рух «важкої підвішеної речі»: ω ∈ ~0.09–0.31 рад/с, нахили ±2.5°/±2°, дрейф ±0.8 % висоти, пік відставання подолу ≈ 5–8°. Числа — орієнтири, тюняться на око.
- Жодних нових npm-залежностей; GLB не змінюється.
- Жодного `setState` на кадр; стан анімації в refs; на кадр — мутації transform + два записи в uniform.
- `TshirtScene.tsx` ≤ 150 рядків; функції ≤ 50 рядків (CLAUDE.md).
- Тестів немає; цикл перевірки = `npx tsc --noEmit` + ESLint по змінених файлах (відома помилка `react-hooks/preserve-manual-memoization` в useWind:62 — pre-existing, НЕ чіпати і не рахувати за регресію) + `npm run build` у Task 3.
- ⚠️ Дерево містить незакомічені зміни міграції R3F. Коміти ТІЛЬКИ явним pathspec (`git commit -m "..." -- <файли>`). Ніколи `git commit -am`.
- Коміт-меседжі українською `feat(v2)/refactor(v2): ...` із трейлером `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Хук `useIdleMotion` — хореографія і lag

**Files:**

- Create: `src/widgets/HeroVisual/useIdleMotion.ts`

**Interfaces:**

- Consumes: `Group` (зовнішня група сцени), `delta`, `elapsed` з useFrame.
- Produces: `useIdleMotion()` повертає `(group: Group, delta: number, elapsed: number) => number` — крок, що мутує transform і повертає згладжений lag. Task 2 подає lag у шейдер, Task 3 викликає крок.

- [ ] **Step 1: Створити `src/widgets/HeroVisual/useIdleMotion.ts` із повним кодом**

```ts
// src/widgets/HeroVisual/useIdleMotion.ts
// «Підвішена маса»: нерівномірний оберт (інтеграл ω по кадрах), маятникові
// нахили, вертикальний дрейф і згладжений lag тканини для шейдера вітру.
// Стан у refs, мутації transform із useFrame сцени — нуль React-рендерів.
'use client';

import { useCallback, useRef } from 'react';
import type { Group } from 'three';

// Орієнтири зі спеки (docs/superpowers/specs/2026-08-11-tshirt-idle-mass-design.md).
// Тюняться на око, не ламаючи характеру «важка підвішена річ».
const BASE_SPEED = 0.2; // рад/с
const MOD1_AMP = 0.35; // дихання швидкості: дві некратні синусоїди
const MOD1_FREQ = 0.23; // рад/с (~27 с період)
const MOD2_AMP = 0.2;
const MOD2_FREQ = 0.37; // (~17 с)
const MOD2_PHASE = 1.7;
const TILT_X_AMP = (2.5 * Math.PI) / 180; // маятникові нахили
const TILT_X_FREQ = (2 * Math.PI) / 9.3;
const TILT_Z_AMP = (2.0 * Math.PI) / 180;
const TILT_Z_FREQ = (2 * Math.PI) / 7.1;
const BOB_AMP = 0.006; // вертикальний дрейф ≈ 0.8 % висоти (0.736)
const BOB_FREQ = (2 * Math.PI) / 11;
const LAG_GAIN = 2.5; // α → зсув тканини; ≈ 6° відставання подолу на піку
const MAX_ALPHA = 0.06; // рад/с² — гасить сплеск α після фонової вкладки
const LAG_SMOOTHING = 5; // 1/с — експоненційне згладження lag
const MAX_DELTA = 1 / 30;

export const useIdleMotion = () => {
  const angle = useRef(0);
  const prevOmega = useRef(BASE_SPEED);
  const lag = useRef(0);

  return useCallback((group: Group, delta: number, elapsed: number) => {
    const dt = Math.min(delta, MAX_DELTA);
    const omega =
      BASE_SPEED *
      (1 +
        MOD1_AMP * Math.sin(MOD1_FREQ * elapsed) +
        MOD2_AMP * Math.sin(MOD2_FREQ * elapsed + MOD2_PHASE));
    angle.current += omega * dt;
    const rawAlpha = dt > 0 ? (omega - prevOmega.current) / dt : 0;
    const alpha = Math.max(-MAX_ALPHA, Math.min(MAX_ALPHA, rawAlpha));
    prevOmega.current = omega;
    // Тканина тягнеться ПРОТИ прискорення; згладження ховає кадровий шум
    lag.current += (-alpha * LAG_GAIN - lag.current) * Math.min(1, dt * LAG_SMOOTHING);

    group.rotation.y = angle.current;
    group.rotation.x = TILT_X_AMP * Math.sin(TILT_X_FREQ * elapsed);
    group.rotation.z = TILT_Z_AMP * Math.sin(TILT_Z_FREQ * elapsed);
    group.position.y = BOB_AMP * Math.sin(BOB_FREQ * elapsed);
    return lag.current;
  }, []);
};
```

- [ ] **Step 2: Перевірити типи й лінт**

Run: `npx tsc --noEmit && npx eslint src/widgets/HeroVisual/useIdleMotion.ts`
Expected: без помилок (файл ще не імпортується — це нормально).

- [ ] **Step 3: Закомітити (pathspec!)**

```bash
git add src/widgets/HeroVisual/useIdleMotion.ts
git commit -m "feat(v2): хук useIdleMotion — інертна хореографія футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useIdleMotion.ts
```

---

### Task 2: `useWind` — uniform lag і тангенційний доданок

**Files:**

- Modify: `src/widgets/HeroVisual/useWind.ts` (три точкові правки)

**Interfaces:**

- Consumes: нічого нового.
- Produces: крок вітру тепер `(elapsedTime: number, lag: number) => void`; uniform `uWindLag` у `material.userData`. Task 3 передає lag із idle-кроку.

- [ ] **Step 1: Додати оголошення uniform у vertex-шейдер**

Було (в `patchMaterial`):

```ts
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
```

Стає:

```ts
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;\nuniform float uWindLag;')
```

- [ ] **Step 2: Завести uniform у userData і прив'язати в onBeforeCompile**

Було:

```ts
const patchMaterial = (material: MeshStandardMaterial, bottom: number, height: number) => {
  material.userData.uWindTime ??= { value: 0 };
  if (material.userData.windPatched) return;
  material.userData.windPatched = true;
  material.customProgramCacheKey = () => 'tshirt-wind';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = material.userData.uWindTime;
```

Стає:

```ts
const patchMaterial = (material: MeshStandardMaterial, bottom: number, height: number) => {
  material.userData.uWindTime ??= { value: 0 };
  material.userData.uWindLag ??= { value: 0 };
  if (material.userData.windPatched) return;
  material.userData.windPatched = true;
  material.customProgramCacheKey = () => 'tshirt-wind';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = material.userData.uWindTime;
    shader.uniforms.uWindLag = material.userData.uWindLag;
```

- [ ] **Step 3: Тангенційний доданок у chunk (після радіального зміщення)**

Було (кінець `windChunk`):

```ts
  transformed += windDir * windWave * windW * ${glslFloat(WIND_AMPLITUDE)};
  transformed.x += sin(uWindTime * ${glslFloat(SWAY_SPEED)}) * windW * ${glslFloat(WIND_AMPLITUDE * SWAY_RATIO)};
}
`;
```

Стає:

```ts
  transformed += windDir * windWave * windW * ${glslFloat(WIND_AMPLITUDE)};
  transformed.x += sin(uWindTime * ${glslFloat(SWAY_SPEED)}) * windW * ${glslFloat(WIND_AMPLITUDE * SWAY_RATIO)};
  // Інерція: тканина відстає від прискорень оберту. Тангенс (-z,0,x) спільний
  // для обох шарів тканини — шари рухаються разом, проколи неможливі
  transformed += vec3(-position.z, 0.0, position.x) * uWindLag * windW;
}
`;
```

- [ ] **Step 4: Розширити сигнатуру кроку**

Було (кінець `useWind`):

```ts
    patchMaterial(material, box.bottom, box.height);
    const uniform = material.userData.uWindTime as { value: number };
    return (elapsedTime: number) => {
      uniform.value = elapsedTime;
    };
```

Стає:

```ts
    patchMaterial(material, box.bottom, box.height);
    const uniform = material.userData.uWindTime as { value: number };
    const lagUniform = material.userData.uWindLag as { value: number };
    return (elapsedTime: number, lag: number) => {
      uniform.value = elapsedTime;
      lagUniform.value = lag;
    };
```

Гілка `if (!material) return () => {};` лишається як є — no-op сумісний із новою сигнатурою.

- [ ] **Step 5: Перевірити типи й лінт**

Run: `npx tsc --noEmit && npx eslint src/widgets/HeroVisual/useWind.ts`
Expected: tsc чистий; ESLint показує ЛИШЕ відому pre-existing помилку `react-hooks/preserve-manual-memoization` на useMemo (не нова).

- [ ] **Step 6: Закомітити (pathspec!)**

```bash
git add src/widgets/HeroVisual/useWind.ts
git commit -m "feat(v2): uniform uWindLag — тангенційне відставання тканини у вітрі

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useWind.ts
```

---

### Task 3: Підключити idle-рух у `TshirtScene`

**Files:**

- Modify: `src/widgets/HeroVisual/TshirtScene.tsx` (імпорт, виклик хука, useFrame; плюс 4 скорочення коментарів, щоб лишитись ≤ 150 рядків)

**Interfaces:**

- Consumes: `useIdleMotion()` з Task 1, розширений `windStep(elapsed, lag)` з Task 2.
- Produces: нічого нового назовні; пропси без змін.

- [ ] **Step 1: Імпорт і константа**

Після рядка `import { useJump } from './useJump';` вже є `import { useWind } from './useWind';` — додати після нього:

```tsx
import { useIdleMotion } from './useIdleMotion';
```

Рядок `const ROTATION_SPEED = 0.3;` і 2-рядковий коментар над ним ВИДАЛИТИ (швидкість тепер живе в useIdleMotion).

- [ ] **Step 2: Виклик хука**

Після `const windStep = useWind(prepared, box);` додати:

```tsx
  const idleStep = useIdleMotion();
```

- [ ] **Step 3: Новий useFrame**

Було:

```tsx
  // Стрибок мутує внутрішню групу, оберт — зовнішню; в одному кадрі
  // вони не конфліктують. Фолбек-оберт лишається кодовим: камера належить
  // <Bounds>, і рух нею збив би підігнане кадрування.
  useFrame((state, delta) => {
    windStep(state.clock.elapsedTime);
    if (interactive) jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });
```

Стає:

```tsx
  // Стрибок мутує внутрішню групу, idle-рух — зовнішню: не конфліктують.
  // Запечена анімація (якщо колись з'явиться) повністю вимикає idle-рух.
  useFrame((state, delta) => {
    if (interactive) jump.step(delta);
    if (hasBakedRotation || !group.current) {
      windStep(state.clock.elapsedTime, 0);
      return;
    }
    const lag = idleStep(group.current, delta, state.clock.elapsedTime);
    windStep(state.clock.elapsedTime, lag);
  });
```

- [ ] **Step 4: Чотири скорочення коментарів (бюджет рядків)**

1. Коментар над `useEffect` із baked-анімацією (3 рядки «Обертання, запечене в Blender…») → 1 рядок:

```tsx
  // Запечена в Blender анімація — задум автора моделі: граємо її, а не дублюємо
```

2. Коментар над `useCursor` (1 рядок) лишити як є.
3. Коментар у Canvas про світло (4 рядки «Три джерела замість…») → 2 рядки:

```tsx
      {/* Локальні джерела замість drei Environment (той тягне HDRI з CDN).
          Зустрічне й нижнє світло відбивають край чорної тканини від фону */}
```

4. Коментар «Габарити: X 0.67…» (2 рядки) → 1 рядок:

```tsx
  // Габарити 0.67×0.74×0.36; перед дивиться в +Z — просто на камеру
```

- [ ] **Step 5: Перевірити типи, лінт, розмір і збірку**

Run: `npx tsc --noEmit && npx eslint src/widgets/HeroVisual/TshirtScene.tsx && wc -l src/widgets/HeroVisual/TshirtScene.tsx && npm run build`
Expected: tsc/eslint чисті; файл ≤ 150 рядків; збірка зелена (повільна — чекати).

- [ ] **Step 6: Закомітити (pathspec!)**

```bash
git add src/widgets/HeroVisual/TshirtScene.tsx
git commit -m "feat(v2): інертний idle-рух футболки — дихання оберту, нахили, дрейф

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/TshirtScene.tsx
```

---

### Task 4: Ручна перевірка в браузері й тюнінг

**Files:**

- Modify (лише за потреби): константи `useIdleMotion.ts` / `useWind.ts`

**Interfaces:** consumes працюючу сцену з Task 3; produces підтверджений чекліст зі спеки.

- [ ] **Step 1: Запустити dev-сервер, відкрити головну, дочекатись сцени**

Run: `npm run dev` → `http://localhost:3000`. Chrome-вікно має бути НЕ перекрите іншими вікнами (перекриття заморожує rAF — уроки в пам'яті проєкту).

- [ ] **Step 2: Чекліст зі спеки (дивитись 2–3 повні оберти)**

- швидкість оберту помітно «дихає», є квазі-паузи, повної зупинки немає;
- при розгоні/гальмуванні поділ і рукави відстають і наздоганяють; плечі стабільні;
- нахили/дрейф повільні, ненав'язливі; принт читається весь оберт;
- спина: жодних чорних плям кілька обертів поспіль (шари не колються);
- нахил не обрізається краями полотна (якщо так — margin Bounds 1.15 → 1.2).

- [ ] **Step 3: Тюнінг констант за потреби, коміт**

```bash
git add src/widgets/HeroVisual/useIdleMotion.ts src/widgets/HeroVisual/useWind.ts
git commit -m "style(v2): тюнінг інертного руху футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useIdleMotion.ts src/widgets/HeroVisual/useWind.ts
```

---

## Відомі дрібниці (свідомо прийняті)

- `rotation.y` тепер задається абсолютно (інтеграл у ref), а не інкрементом — рестарт хука (ремаунт) починає кут з 0: невідчутно, бо сцена ремаунтиться разом із канвасом.
- Порядок Ейлера дефолтний (XYZ): при кутах ±2.5° взаємовплив осей невидимий.
- lag передається і в interactive-режимі під час стрибка — фізично це «правильно» (тканину тягне завжди), окремого гейта не треба.

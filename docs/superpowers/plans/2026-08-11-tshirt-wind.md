# Вітер на 3D-футболці — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** постійне делікатне колихання тканини футболки в герої — вершинний вітер у шейдері поверх наявного матеріалу, поділ і рукави рухаються, плечі стоять.

**Architecture:** новий хук `useWind` патчить `MeshStandardMaterial` футболки через `onBeforeCompile`: вагова карта зі smoothstep по локальних координатах, дві октави синусоїд уздовж нормалі + повільний X-погойд, один uniform часу. Патч ідемпотентний (guard і uniform живуть у `material.userData`, бо `useGLTF` кешує сцену між маунтами). `TshirtScene` додає виклик хука і запис часу в наявному useFrame.

**Tech Stack:** three (GLSL-патч через onBeforeCompile), React Three Fiber 9. Нових залежностей немає.

**Спека:** `docs/superpowers/specs/2026-08-11-tshirt-wind-design.md`

## Global Constraints

- Амплітуда «легко»: ~1–1.5 % висоти моделі на подолі; вага 0 у верхніх ~20 %; рух помітний, але не відволікає. Числа в коді — орієнтири, тюняться на око.
- Жодних нових npm-залежностей; GLB (`public/model/tshirt.glb`) не змінюється.
- Жодного `setState` на кадр; на кадр — рівно один запис числа в uniform, нуль алокацій.
- `TshirtScene.tsx` лишається < 150 рядків; функції ≤ 50 рядків, React-компоненти ≤ 150 (CLAUDE.md, підтверджене правило з попереднього плану).
- Тестів у репо немає; цикл перевірки = `npx tsc --noEmit` + `npm run lint` (+ `npm run build` у Task 2).
- ⚠️ Робоче дерево містить незакомічені зміни міграції R3F, а в індексі висить `model/NOred.glb`. Комітити ТІЛЬКИ явним pathspec: `git commit -m "..." -- <файли>`. Ніколи `git commit -am` чи коміт без pathspec.
- Коміт-меседжі українською в стилі репо (`feat(v2): ...`) із трейлером `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Хук `useWind` — шейдерний патч вітру

**Files:**

- Create: `src/widgets/HeroVisual/useWind.ts`

**Interfaces:**

- Consumes: `Group` (підготовлена сцена з useGLTF) і `{ bottom: number; height: number }` (замір Box3, який `TshirtScene` вже робить для стрибка).
- Produces: `useWind(scene, box)` повертає `(elapsedTime: number) => void` — крок вітру, який Task 2 викликає з useFrame зі `state.clock.elapsedTime`.

Механіка GLSL: вагова карта `windW` = smoothstep по нормалізованій висоті (1 на подолі, 0 від ~80 % висоти) + половинний внесок рукавів за |x|; зміщення = дві синусоїди (різні частоти/швидкості) уздовж `objectNormal` + повільний погойд по X. Всі числа інтерполюються в GLSL з констант угорі файлу (`toFixed`, щоб літерали мали десяткову крапку). Розміри моделі приходять із заміру Box3, тому в шейдері немає магічних координат.

- [ ] **Step 1: Створити `src/widgets/HeroVisual/useWind.ts` із повним кодом**

```ts
// src/widgets/HeroVisual/useWind.ts
// Вітер тканини: вершинний шейдер поверх наявного матеріалу футболки.
// Вага руху рахується з локальних координат (поділ і рукави гойдаються,
// плечі стоять), зміщення — дві октави синусоїд уздовж нормалі + повільний
// X-погойд. Патч ідемпотентний: useGLTF кешує сцену між маунтами, тому
// guard і uniform часу живуть у material.userData, а не в замиканні хука.
'use client';

import { useMemo } from 'react';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

// Орієнтири руху — зі спеки (docs/superpowers/specs/2026-08-11-tshirt-wind-design.md).
// Тюняться на око, не втрачаючи характеру «легко».
const WIND_AMPLITUDE = 0.01; // ≈1.35 % висоти моделі (0.74) на подолі
const WAVE1_FREQ = 9.0; // просторова частота першої октави, 1/юніт
const WAVE1_SPEED = 1.6; // рад/с
const WAVE2_FREQ = 16.0;
const WAVE2_SPEED = 2.3;
const SWAY_SPEED = 0.7; // повільний загальний погойд по X
const SWAY_RATIO = 0.6; // частка амплітуди для погойду
const TOP_QUIET = 0.8; // вище цієї частки висоти вага 0 (плечі/комір)
const HEM_FULL = 0.1; // нижче цієї частки — повна вага (поділ)
const SLEEVE_START = 0.18; // |x|, з якого починається вага рукава
const SLEEVE_FULL = 0.3; // |x| повної ваги рукава

const glslFloat = (n: number) => n.toFixed(4);

// Вставка в begin_vertex: мутуємо `transformed` до modelMatrix, тому вітер
// обертається разом із футболкою і стискається разом зі стрибком
const windChunk = (bottom: number, height: number) => /* glsl */ `
#include <begin_vertex>
{
  float windH = (position.y - ${glslFloat(bottom)}) / ${glslFloat(height)};
  float windW = min(
    1.0,
    smoothstep(${glslFloat(TOP_QUIET)}, ${glslFloat(HEM_FULL)}, windH)
      + 0.5 * smoothstep(${glslFloat(SLEEVE_START)}, ${glslFloat(SLEEVE_FULL)}, abs(position.x))
  );
  float windWave =
    sin(position.y * ${glslFloat(WAVE1_FREQ)} + uWindTime * ${glslFloat(WAVE1_SPEED)}) * 0.6
      + sin((position.x + position.y) * ${glslFloat(WAVE2_FREQ)} + uWindTime * ${glslFloat(WAVE2_SPEED)}) * 0.4;
  transformed += objectNormal * windWave * windW * ${glslFloat(WIND_AMPLITUDE)};
  transformed.x += sin(uWindTime * ${glslFloat(SWAY_SPEED)}) * windW * ${glslFloat(WIND_AMPLITUDE * SWAY_RATIO)};
}
`;

const patchMaterial = (material: MeshStandardMaterial, bottom: number, height: number) => {
  material.userData.uWindTime ??= { value: 0 };
  if (material.userData.windPatched) return;
  material.userData.windPatched = true;
  material.customProgramCacheKey = () => 'tshirt-wind';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = material.userData.uWindTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
      .replace('#include <begin_vertex>', windChunk(bottom, height));
  };
  material.needsUpdate = true;
};

export const useWind = (scene: Group, box: { bottom: number; height: number }) => {
  return useMemo(() => {
    const mesh = scene.getObjectByProperty('isMesh', true) as Mesh | undefined;
    const material = mesh?.material as MeshStandardMaterial | undefined;
    if (!material) return () => {};
    patchMaterial(material, box.bottom, box.height);
    const uniform = material.userData.uWindTime as { value: number };
    return (elapsedTime: number) => {
      uniform.value = elapsedTime;
    };
  }, [scene, box.bottom, box.height]);
};
```

- [ ] **Step 2: Перевірити типи й лінт**

Run: `npx tsc --noEmit && npm run lint`
Expected: обидва без помилок (файл ще ніким не імпортується — це нормально).

- [ ] **Step 3: Закомітити (тільки цей файл, pathspec!)**

```bash
git add src/widgets/HeroVisual/useWind.ts
git commit -m "feat(v2): хук useWind — вершинний вітер тканини футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useWind.ts
```

---

### Task 2: Підключити вітер у `TshirtScene`

**Files:**

- Modify: `src/widgets/HeroVisual/TshirtScene.tsx` (три точкові правки; решта файлу НЕ змінюється)

**Interfaces:**

- Consumes: `useWind(scene, box)` з Task 1 — повертає `(elapsedTime: number) => void`.
- Produces: нічого нового назовні; пропси `TshirtScene` не змінюються.

- [ ] **Step 1: Додати імпорт хука**

Після рядка:

```tsx
import { useJump } from './useJump';
```

додати:

```tsx
import { useWind } from './useWind';
```

- [ ] **Step 2: Викликати хук поряд із useJump**

Було:

```tsx
  const jump = useJump(jumpRef, box.height);
```

Стає:

```tsx
  const jump = useJump(jumpRef, box.height);
  const windStep = useWind(prepared, box);
```

- [ ] **Step 3: Оновити useFrame — час вітру одним рядком**

Було:

```tsx
  useFrame((_, delta) => {
    jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });
```

Стає:

```tsx
  useFrame((state, delta) => {
    windStep(state.clock.elapsedTime);
    jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });
```

Коментар над useFrame («Стрибок мутує внутрішню групу…») лишається як є.

- [ ] **Step 4: Перевірити типи, лінт, розмір і збірку**

Run: `npx tsc --noEmit && npm run lint && wc -l src/widgets/HeroVisual/TshirtScene.tsx && npm run build`
Expected: без помилок; файл < 150 рядків; збірка зелена.

- [ ] **Step 5: Закомітити (тільки цей файл, pathspec!)**

```bash
git add src/widgets/HeroVisual/TshirtScene.tsx
git commit -m "feat(v2): вітер тканини на 3D-футболці в герої

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/TshirtScene.tsx
```

---

### Task 3: Ручна перевірка в браузері й тюнінг на око

**Files:**

- Modify (лише якщо тюнінг потрібен): константи вгорі `src/widgets/HeroVisual/useWind.ts`

**Interfaces:**

- Consumes: працюючу сцену з Task 2.
- Produces: підтверджений чекліст зі спеки; за потреби — підправлені константи.

- [ ] **Step 1: Запустити dev-сервер і відкрити головну**

Run: `npm run dev` → `http://localhost:3000`, дочекатись появи 3D-сцени.

- [ ] **Step 2: Пройти чекліст поведінки (зі спеки)**

- брижі видно на подолі й кінцях рукавів; плечі/комір практично нерухомі;
- амплітуда «легка»: рух помітний, але не відволікає від тексту героя;
- обертання працює як раніше; вітер обертається разом із футболкою;
- клік → стрибок працює як раніше; під час польоту тканина далі колишеться;
- DevTools → Rendering → `prefers-reduced-motion: reduce` → перезавантажити: сцени немає, статичне фото;
- переходь на іншу сторінку і назад (повторний маунт сцени) — вітер живий, у консолі немає помилок шейдера.

- [ ] **Step 3: Якщо щось відчувається не так — тюнити константи**

Крутити тільки константи вгорі `useWind.ts` (амплітуду, частоти/швидкості октав, межі ваги). Межі зі спеки: амплітуда ~1–1.5 % висоти, верхні ~20 % нерухомі.

- [ ] **Step 4: Закомітити тюнінг, якщо був**

```bash
git add src/widgets/HeroVisual/useWind.ts
git commit -m "style(v2): тюнінг вітру тканини

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useWind.ts
```

---

## Відомі дрібниці (свідомо прийняті)

- Нормалі не перераховуються після зміщення — на амплітуді ~1 % висоти розбіжність освітлення оком не зчитується (зафіксовано в спеці).
- Після повернення з фонової вкладки `state.clock.elapsedTime` стрибає вперед — синусоїди неперервні за часом, тож видимого ривка немає.
- `customProgramCacheKey` статичний (`'tshirt-wind'`): матеріал один, варіант шейдера один; при зміні констант у dev достатньо перезавантаження сторінки.

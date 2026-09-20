# Інтерактивний стрибок 3D-футболки — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** натиск на 3D-футболку в герої — присідання, відпускання — пружний стрибок із squash & stretch і м'яким приземленням; обертання не переривається.

**Architecture:** стан-машина `idle → pressed → returning|airborne → landing → idle` у новому хуку `useJump` (весь стан у refs, мутації transform у наявному useFrame — нуль React-рендерів на кадр). `TshirtScene` вішає R3F-обробники на групу футболки і переносить pivot масштабування на нижню межу моделі через дві вкладені групи.

**Tech Stack:** React Three Fiber 9, drei 10 (`useCursor`), three (`Box3`). Нових залежностей немає.

**Спека:** `docs/superpowers/specs/2026-08-11-tshirt-jump-design.md`

## Global Constraints

- Весь стрибок від відпускання до спокою ≤ ~700 мс; числа в коді — орієнтири зі спеки, тюняться на око.
- Жодних нових npm-залежностей; GLB (`public/model/tshirt.glb`) не змінюється.
- Жодного `setState` на кадр анімації; єдиний дозволений state — `hovered` для курсора (змінюється лише на enter/leave).
- `TshirtScene.tsx` лишається < 150 рядків; функції ≤ 50 рядків (CLAUDE.md).
- Reduced motion нового коду не потребує: `HeroVisual` вже не вантажить сцену при `prefers-reduced-motion`.
- Тестів у репо немає; цикл перевірки кожної задачі = `npx tsc --noEmit` + `npm run lint` (+ ручний чекліст у Task 3).
- ⚠️ Робоче дерево містить незакомічені зміни міграції R3F, а в індексі висить `model/NOred.glb`. Комітити ТІЛЬКИ явним pathspec: `git commit -m "..." -- <файли>`. Ніколи не робити `git commit -am` чи commit без pathspec.
- Коміт-меседжі — українською в стилі репо: `feat(v2): ...`, з трейлером `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Хук `useJump` — стан-машина і математика пружини

**Files:**

- Create: `src/widgets/HeroVisual/useJump.ts`

**Interfaces:**

- Consumes: `RefObject<Group | null>` (група, яку мутуємо), `height: number` (висота моделі в юнітах сцени).
- Produces: `useJump(targetRef, height)` повертає `{ onPointerDown: () => void; onPointerUp: () => void; onPointerLeave: () => void; step: (delta: number) => void }`. Task 2 викликає `step` із useFrame і вішає обробники на `<group>`.

Фізика: балістичний політ із заданим часом `FLIGHT_TIME` і апексом `JUMP_HEIGHT_RATIO * height`: `v0 = 4H/T`, `g = 8H/T²` (виводиться з `y(T/2)=H`, `y(T)=0`). Приземлення — згасаюче коливання `1 − A·e^(−λt)·cos(ωt)`. Об'єм «тканини» зберігається: `scale.x = scale.z = 1/√scale.y`.

- [ ] **Step 1: Створити `src/widgets/HeroVisual/useJump.ts` із повним кодом**

```ts
// src/widgets/HeroVisual/useJump.ts
// Стан-машина стрибка футболки: натиск — присідання, відпускання — політ,
// приземлення — згасаюча пружина. Весь стан у refs, transform мутується
// покадрово з useFrame сцени — React не рендериться під час анімації.
'use client';

import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import type { Group } from 'three';

type Phase = 'idle' | 'pressed' | 'returning' | 'airborne' | 'landing';

// Орієнтири руху — зі спеки (docs/superpowers/specs/2026-08-11-tshirt-jump-design.md).
// Тюняться на око, не виходячи за «весь стрибок ≤ ~700 мс».
const PRESS_DURATION = 0.09; // присідання, с
const PRESS_SCALE_Y = 0.88;
const RETURN_DURATION = 0.12; // м'яке повернення при скасуванні, с
const JUMP_HEIGHT_RATIO = 0.13; // апекс як частка висоти моделі
const FLIGHT_TIME = 0.35; // політ вгору + вниз, с
const STRETCH = 0.12; // розтяг у польоті на максимальній швидкості
const LANDING_AMPLITUDE = 0.12; // squash у момент удару
const LANDING_FREQ = 40; // рад/с — частота пружини приземлення
const LANDING_DAMPING = 9; // 1/с — згасання пружини
const LANDING_DURATION = 0.3; // с
const MAX_DELTA = 1 / 30; // кламп кадру після фонової вкладки

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3;

// Сплюскування по Y компенсується розширенням по X/Z — об'єм зберігається,
// саме це читається як «пружна тканина», а не «зіжмаканий скріншот»
const applyScaleY = (target: Group, scaleY: number) => {
  const xz = 1 / Math.sqrt(scaleY);
  target.scale.set(xz, scaleY, xz);
};

export const useJump = (targetRef: RefObject<Group | null>, height: number) => {
  const phase = useRef<Phase>('idle');
  const time = useRef(0);
  const releaseQueued = useRef(false);
  const returnFrom = useRef(1); // scaleY, з якого стартує повернення
  const baseY = useRef(0); // position.y групи у спокої

  const jumpHeight = height * JUMP_HEIGHT_RATIO;
  const launchSpeed = (4 * jumpHeight) / FLIGHT_TIME;
  const gravity = (8 * jumpHeight) / FLIGHT_TIME ** 2;

  const onPointerDown = useCallback(() => {
    // Із польоту і приземлення не перезапускаємось — спека: ігнорувати
    if (phase.current !== 'idle' && phase.current !== 'returning') return;
    baseY.current = targetRef.current?.position.y ?? 0;
    phase.current = 'pressed';
    time.current = 0;
    releaseQueued.current = false;
  }, [targetRef]);

  const onPointerUp = useCallback(() => {
    if (phase.current !== 'pressed') return;
    // Швидкий тап: політ стартує лише після повного присідання (див. step)
    releaseQueued.current = true;
  }, []);

  const onPointerLeave = useCallback(() => {
    if (phase.current !== 'pressed') return;
    returnFrom.current = targetRef.current?.scale.y ?? 1;
    phase.current = 'returning';
    time.current = 0;
  }, [targetRef]);

  const step = useCallback(
    (delta: number) => {
      const target = targetRef.current;
      if (!target || phase.current === 'idle') return;
      time.current += Math.min(delta, MAX_DELTA);
      const t = time.current;

      if (phase.current === 'pressed') {
        const u = Math.min(t / PRESS_DURATION, 1);
        applyScaleY(target, 1 + (PRESS_SCALE_Y - 1) * easeOutCubic(u));
        if (u >= 1 && releaseQueued.current) {
          phase.current = 'airborne';
          time.current = 0;
        }
        return;
      }

      if (phase.current === 'returning') {
        const u = Math.min(t / RETURN_DURATION, 1);
        applyScaleY(target, returnFrom.current + (1 - returnFrom.current) * easeOutCubic(u));
        if (u >= 1) phase.current = 'idle';
        return;
      }

      if (phase.current === 'airborne') {
        const y = launchSpeed * t - (gravity * t * t) / 2;
        const v = launchSpeed - gravity * t;
        if (y <= 0 && v < 0) {
          target.position.y = baseY.current;
          applyScaleY(target, 1 - LANDING_AMPLITUDE);
          phase.current = 'landing';
          time.current = 0;
        } else {
          target.position.y = baseY.current + y;
          // Розтяг уздовж руху: максимум на зльоті/ударі, нейтраль в апексі
          applyScaleY(target, 1 + (STRETCH * Math.abs(v)) / launchSpeed);
        }
        return;
      }

      // landing: згасаюча пружина навколо scale 1
      const u = Math.min(t / LANDING_DURATION, 1);
      const scaleY = 1 - LANDING_AMPLITUDE * Math.exp(-LANDING_DAMPING * t) * Math.cos(LANDING_FREQ * t);
      applyScaleY(target, u >= 1 ? 1 : scaleY);
      if (u >= 1) phase.current = 'idle';
    },
    [targetRef, launchSpeed, gravity]
  );

  return { onPointerDown, onPointerUp, onPointerLeave, step };
};
```

- [ ] **Step 2: Перевірити типи й лінт**

Run: `npx tsc --noEmit && npm run lint`
Expected: обидва без помилок (файл ще ніким не імпортується — це нормально).

- [ ] **Step 3: Закомітити (тільки цей файл, pathspec!)**

```bash
git add src/widgets/HeroVisual/useJump.ts
git commit -m "feat(v2): хук useJump — стан-машина стрибка футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useJump.ts
```

---

### Task 2: Підключити стрибок у `TshirtScene`

**Files:**

- Modify: `src/widgets/HeroVisual/TshirtScene.tsx` (компонент `Tshirt` і імпорти; `Canvas`-обгортка внизу файлу НЕ змінюється)

**Interfaces:**

- Consumes: `useJump(jumpRef, height)` з Task 1 — `{ onPointerDown, onPointerUp, onPointerLeave, step }`.
- Produces: нічого нового назовні; пропси `TshirtScene` не змінюються, тож `HeroVisual.tsx` не чіпаємо.

Що робимо: (1) міряємо модель через `Box3` — низ і висота; (2) переносимо pivot масштабування на нижню межу двома вкладеними групами (`+bottom` / `−bottom` — сумарний transform нульовий, кадрування `<Bounds>` не зсувається); (3) вішаємо обробники на зовнішню групу; (4) кличемо `jump.step(delta)` з наявного useFrame; (5) курсор-pointer через `useCursor`. Оберт лишається на зовнішній групі, стрибок мутує внутрішню — не конфліктують.

- [ ] **Step 1: Оновити імпорти на початку файлу**

Було:

```tsx
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useAnimations, useGLTF } from '@react-three/drei';
import type { Group, Mesh } from 'three';
```

Стає:

```tsx
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useAnimations, useCursor, useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import type { Group, Mesh } from 'three';
import { useJump } from './useJump';
```

- [ ] **Step 2: Замінити компонент `Tshirt` цілком**

Замінити весь `const Tshirt = ({ onReady }: Props) => { ... };` на:

```tsx
const Tshirt = ({ onReady }: Props) => {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const jumpRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { actions } = useAnimations(animations, group);

  // Курсор-pointer над футболкою: підказка «мене можна натиснути»
  useCursor(hovered);

  const hasBakedRotation = animations.length > 0;

  // Обертання, запечене в Blender, — це задум автора моделі: власна швидкість,
  // власна вісь. Програємо його замість того, щоб дублювати рух кодом.
  useEffect(() => {
    if (!hasBakedRotation) return;
    const [firstAction] = Object.values(actions);
    firstAction?.reset().play();
  }, [actions, hasBakedRotation]);

  // Страховка на випадок моделі без нормалей: без них матеріал нічим
  // освітлювати й тканина виходить пласкою плямою. У поточній вони є.
  const prepared = useMemo(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && !mesh.geometry.getAttribute('normal')) {
        mesh.geometry.computeVertexNormals();
      }
    });
    return scene;
  }, [scene]);

  // Низ і висота моделі: pivot присідання і масштаб висоти стрибка
  const box = useMemo(() => {
    const b = new Box3().setFromObject(prepared);
    return { bottom: b.min.y, height: b.max.y - b.min.y };
  }, [prepared]);

  const jump = useJump(jumpRef, box.height);

  // Стрибок мутує внутрішню групу, оберт — зовнішню; в одному кадрі
  // вони не конфліктують. Фолбек-оберт лишається кодовим: камера належить
  // <Bounds>, і рух нею збив би підігнане кадрування.
  useFrame((_, delta) => {
    jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });

  // useGLTF саспендиться до завантаження, тож монтування = модель готова
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Габарити: X 0.67 (ширина) · Y 0.74 (висота) · Z 0.36 (товщина). Перед уже
  // дивиться в +Z, тобто просто на камеру — доводити орієнтацію не треба.
  return (
    <group
      ref={group}
      onPointerDown={jump.onPointerDown}
      onPointerUp={jump.onPointerUp}
      onPointerLeave={jump.onPointerLeave}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}>
      {/* Пара +bottom/−bottom переносить pivot масштабування на нижню межу:
          присідання тисне «в підлогу», а не стискає футболку в повітрі.
          Сумарний transform нульовий — кадрування Bounds не зсувається. */}
      <group ref={jumpRef} position={[0, box.bottom, 0]}>
        <group position={[0, -box.bottom, 0]}>
          <primitive object={prepared} />
        </group>
      </group>
    </group>
  );
};
```

- [ ] **Step 3: Перевірити типи, лінт і розмір файлу**

Run: `npx tsc --noEmit && npm run lint && wc -l src/widgets/HeroVisual/TshirtScene.tsx`
Expected: без помилок; файл < 150 рядків.

- [ ] **Step 4: Перевірити продакшен-збірку**

Run: `npm run build`
Expected: збірка зелена (type check і ESLint у ній увімкнені).

- [ ] **Step 5: Закомітити (тільки цей файл, pathspec!)**

```bash
git add src/widgets/HeroVisual/TshirtScene.tsx
git commit -m "feat(v2): стрибок футболки по кліку — squash & stretch у дусі Дії

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/TshirtScene.tsx
```

---

### Task 3: Ручна перевірка в браузері й тюнінг на око

**Files:**

- Modify (лише якщо тюнінг потрібен): константи в `src/widgets/HeroVisual/useJump.ts`

**Interfaces:**

- Consumes: працюючу сцену з Task 2.
- Produces: підтверджений чекліст зі спеки; за потреби — підправлені константи.

- [ ] **Step 1: Запустити dev-сервер і відкрити головну**

Run: `npm run dev` → відкрити `http://localhost:3000`, доскролити до героя, дочекатись появи 3D-сцени (вона lazy — вантажиться при потраплянні у в'юпорт).

- [ ] **Step 2: Пройти чекліст поведінки (зі спеки)**

- клік мишею: присідання → стрибок → пружне приземлення; весь цикл від відпускання ≤ ~0.7 с на око;
- швидкий клік (down+up миттєво): присідання все одно відіграється повністю, потім стрибок;
- утримання: футболка сидить сплюснута, поки тримаєш;
- натиснув → відвів курсор із футболки: м'яке повернення БЕЗ стрибка;
- повторні кліки під час польоту/приземлення ігноруються;
- обертання не зупиняється в жодній фазі;
- присідання «тисне в підлогу»: низ футболки не відривається від тіні;
- апекс стрибка не кліпиться верхнім краєм полотна (якщо кліпиться — у `TshirtScene.tsx` підняти `margin` у `<Bounds>` з `1.15` до `1.2`, НЕ рухати камеру);
- курсор над футболкою — pointer, поза нею — звичайний;
- DevTools → Toggle device toolbar → тап працює як клік;
- DevTools → Rendering → `prefers-reduced-motion: reduce` → перезавантажити: сцени немає, статичне фото на місці.

- [ ] **Step 3: Якщо щось відчувається не так — тюнити константи**

Крутити тільки константи вгорі `useJump.ts` (тривалості, `JUMP_HEIGHT_RATIO`, `STRETCH`, частоту/згасання приземлення). Межі зі спеки: весь стрибок ≤ ~700 мс, апекс ≈ 12–15 % висоти.

- [ ] **Step 4: Закомітити тюнінг, якщо був**

```bash
git add src/widgets/HeroVisual/useJump.ts
git commit -m "style(v2): тюнінг таймінгів стрибка футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useJump.ts
```

---

## Відомі дрібниці (свідомо прийняті)

- Перехід «сплюснута 0.88 → розтягнута 1.12» на кадрі зльоту різкий навмисно: анімаційний принцип anticipation→stretch, читається як вибуховий старт (мова Дії — миттєвий старт).
- Якщо затиснути футболку і тримати курсор нерухомо, а силует за кілька секунд обертання вийде з-під курсора — `pointerup` повз меш не зловиться, футболка лишиться сплюснутою до наступного руху мишею (будь-який рух видасть leave → м'яке повернення). Випадок нереалістичний для пасхалки; pointer capture ламав би скасування через leave, тому не використовуємо.
- DOM-тінь під футболкою на стрибок не реагує (YAGNI зі спеки).

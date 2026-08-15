# Drag-обертання футболки — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. (Фактичне виконання: інлайн контролером за прямою вказівкою користувача «зразу реалізуй, не питай».)

**Goal:** крутити футболку рукою поверх живого idle-руху; на релізі — плавне повернення до власного руху через momentum-злиття.

**Architecture:** DOM-хук `useDragRotation` (стан у ref, обробники на `.stage`); `useIdleMotion(dragRef?)` споживає драг у step єдиним ω-конвеєром (рука → momentum → idle), тож наявний α→lag ланцюг тканини реагує на всі переходи; `TshirtScene` лише прокидає ref.

**Спека:** `docs/superpowers/specs/2026-08-12-tshirt-drag-rotate-design.md`

## Global Constraints

- Чутливість 0.01 рад/px; |ω драгу| ≤ 8 рад/с; momentum-згасання ~2.2 1/с.
- `TshirtScene.tsx` ≤ 150 рядків; функції ≤ 50 рядків; жодного setState на кадр.
- `HeroVisual.tsx`/`.scss` — WIP: правити, НЕ комітити. Комітяться: `useDragRotation.ts`, `useIdleMotion.ts`, `TshirtScene.tsx`.
- Коміти pathspec, українською, трейлер `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Верифікація: tsc + eslint змінених файлів + build; жива перевірка драгу через real-events розширення.

---

### Task 1: `useDragRotation.ts` (новий, комітиться)

```ts
// src/widgets/HeroVisual/useDragRotation.ts
// DOM-захоплення горизонтального драгу для обертання 3D-об'єкта. Стан у ref:
// сцена читає його покадрово, React не рендериться. Тільки primary-pointer.
'use client';

import { useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

export type DragState = {
  active: boolean;
  /** накопичений неспожитий кут, рад (споживає idle-крок сцени) */
  pendingAngle: number;
  /** остання кутова швидкість руки, рад/с */
  velocity: number;
};

const SENSITIVITY = 0.01; // рад на піксель
const VELOCITY_SMOOTHING = 0.5; // згладження між pointermove-подіями

export const useDragRotation = (): {
  dragRef: RefObject<DragState>;
  handlers: {
    onPointerDown: (e: ReactPointerEvent) => void;
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
    onPointerCancel: (e: ReactPointerEvent) => void;
  };
} => {
  const dragRef = useRef<DragState>({ active: false, pendingAngle: 0, velocity: 0 });
  const last = useRef({ x: 0, t: 0, id: -1 });

  const handlers = useMemo(() => {
    const finish = (e: ReactPointerEvent) => {
      if (!dragRef.current.active || e.pointerId !== last.current.id) return;
      dragRef.current.active = false; // velocity лишається — momentum підхопить
    };
    return {
      onPointerDown: (e: ReactPointerEvent) => {
        if (!e.isPrimary) return;
        dragRef.current.active = true;
        dragRef.current.velocity = 0;
        last.current = { x: e.clientX, t: performance.now(), id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e: ReactPointerEvent) => {
        if (!dragRef.current.active || e.pointerId !== last.current.id) return;
        const now = performance.now();
        const dx = e.clientX - last.current.x;
        const dt = (now - last.current.t) / 1000;
        const angle = dx * SENSITIVITY;
        dragRef.current.pendingAngle += angle;
        if (dt > 0) {
          const instant = angle / dt;
          dragRef.current.velocity += (instant - dragRef.current.velocity) * VELOCITY_SMOOTHING;
        }
        last.current.x = e.clientX;
        last.current.t = now;
      },
      onPointerUp: finish,
      onPointerCancel: finish,
    };
  }, []);

  return { dragRef, handlers };
};
```

- [ ] tsc + eslint файлу; коміт pathspec `feat(v2): хук useDragRotation — DOM-захоплення обертання рукою`

### Task 2: драг-конвеєр у `useIdleMotion`

Сигнатура: `useIdleMotion(dragRef?: RefObject<DragState | null>)`. Імпорт
`import type { DragState } from './useDragRotation';` і `RefObject` з react.
Нові конст: `MAX_DRAG_OMEGA = 8;` `MOMENTUM_DECAY = 2.2;`
Нові ref: `momentum = useRef(0);` `prevDragActive = useRef(false);`

Новий step (цілком, ≤ 50 рядків):

```ts
return useCallback(
  (group: Group, delta: number, elapsed: number) => {
    const dt = Math.min(delta, MAX_DELTA);
    const idleOmega =
      BASE_SPEED *
      (1 + MOD1_AMP * Math.sin(MOD1_FREQ * elapsed) + MOD2_AMP * Math.sin(MOD2_FREQ * elapsed + MOD2_PHASE));

    const drag = dragRef?.current;
    let omega: number;
    if (drag?.active) {
      // Рука веде кут напряму; ω-конвеєр живиться швидкістю руки,
      // щоб α→lag тканини реагував на ривки
      angle.current += drag.pendingAngle;
      drag.pendingAngle = 0;
      omega = Math.max(-MAX_DRAG_OMEGA, Math.min(MAX_DRAG_OMEGA, drag.velocity));
      prevDragActive.current = true;
    } else {
      if (prevDragActive.current) {
        // Реліз: підхопити надлишок швидкості руки як momentum
        const v = Math.max(-MAX_DRAG_OMEGA, Math.min(MAX_DRAG_OMEGA, drag?.velocity ?? 0));
        momentum.current = v - idleOmega;
        prevDragActive.current = false;
      }
      momentum.current *= Math.exp(-MOMENTUM_DECAY * dt);
      omega = idleOmega + momentum.current;
      angle.current += omega * dt;
    }

    const rawAlpha = dt > 0 ? (omega - prevOmega.current) / dt : 0;
    const alpha = Math.max(-MAX_ALPHA, Math.min(MAX_ALPHA, rawAlpha));
    prevOmega.current = omega;
    lag.current += (-alpha * LAG_GAIN - lag.current) * Math.min(1, dt * LAG_SMOOTHING);

    group.rotation.y = angle.current;
    group.rotation.x = TILT_X_AMP * Math.sin(TILT_X_FREQ * elapsed);
    group.rotation.z = TILT_Z_AMP * Math.sin(TILT_Z_FREQ * elapsed);
    group.position.y = BOB_AMP * Math.sin(BOB_FREQ * elapsed);
    return lag.current;
  },
  [dragRef]
);
```

Примітка: `MAX_ALPHA` лишається 0.06 для idle-плавності; ривки руки самі по
собі більші — це ок, кламп тримає lag у межах пружності (жорсткішого клампу
не вводимо, тюн на око при перевірці).

- [ ] tsc + eslint; коміт `feat(v2): useIdleMotion приймає драг — рука, momentum і idle в одному ω-конвеєрі`

### Task 3: прокид `dragRef` у `TshirtScene`

- Props: `/** Ref драг-обертання зі stage; сцена лише читає */` + `dragRef?: RefObject<DragState | null>;` (import type з `./useDragRotation`, RefObject з react)
- `Tshirt`: параметр + `useIdleMotion(dragRef)`
- Обгортка: прийняти/прокинути. Бюджет ≤ 150: за потреби ще одне скорочення коментаря (кандидат — дворядковий коментар над useFrame → один рядок).
- [ ] tsc + eslint + wc + build; коміт `feat(v2): проп dragRef на TshirtScene`

### Task 4: HeroVisual + CSS (WIP, БЕЗ коміту) і жива перевірка

- `const { dragRef, handlers } = useDragRotation();`
- `.stage`: `{...handlers}` + передати `dragRef` у `<TshirtScene>`
- SCSS `.stage`: `touch-action: pan-y; cursor: grab;` + `&:active { cursor: grabbing; }`
- [ ] tsc + build; жива перевірка: real `left_click_drag` по сцені → кут слідує за рукою; реліз → плавне продовження; фліки; свотчі клікаються; вертикальний скрол живий

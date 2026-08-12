// src/widgets/HeroVisual/useIdleMotion.ts
// «Підвішена маса»: нерівномірний оберт (інтеграл ω по кадрах), маятникові
// нахили, вертикальний дрейф і згладжений lag тканини для шейдера вітру.
// Опційний dragRef дає крутити рукою: кут веде рука, а на релізі її швидкість
// підхоплюється momentum-ом і згасає в idle-ω. Стан у refs, нуль рендерів.
'use client';

import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import type { Group } from 'three';
import type { DragState } from './useDragRotation';

// Орієнтири зі спек (idle-mass + drag-rotate). Тюняться на око.
const BASE_SPEED = 0.22; // рад/с
const MOD1_AMP = 0.28; // дихання швидкості: дві некратні синусоїди;
const MOD1_FREQ = 0.23; // менші амплітуди — щоб «пауза» (мін ~0.13 рад/с,
const MOD2_AMP = 0.14; // ~7.5°/с) читалась як повільний рух, не як зупинка
const MOD2_FREQ = 0.37;
const MOD2_PHASE = 1.7;
const TILT_X_AMP = (3.2 * Math.PI) / 180; // маятникові нахили
const TILT_X_FREQ = (2 * Math.PI) / 9.3;
const TILT_Z_AMP = (2.6 * Math.PI) / 180;
const TILT_Z_FREQ = (2 * Math.PI) / 7.1;
const BOB_AMP = 0.006; // вертикальний дрейф ≈ 0.8 % висоти (0.736)
const BOB_FREQ = (2 * Math.PI) / 11;
const LAG_GAIN = 2.5; // α → зсув тканини; ≈ 4.5° відставання подолу на піку
const MAX_ALPHA = 0.06; // рад/с² — гасить сплеск α після фонової вкладки
const LAG_SMOOTHING = 5; // 1/с — експоненційне згладження lag
const MAX_DELTA = 1 / 30;
const MAX_DRAG_OMEGA = 8; // рад/с — кламп швидкості руки (фліки)
const MOMENTUM_DECAY = 2.2; // 1/с — згасання momentum у idle-ω після релізу

const clampOmega = (v: number) => Math.max(-MAX_DRAG_OMEGA, Math.min(MAX_DRAG_OMEGA, v));

export const useIdleMotion = (dragRef?: RefObject<DragState | null>) => {
  const angle = useRef(0);
  const prevOmega = useRef(BASE_SPEED);
  const lag = useRef(0);
  const momentum = useRef(0);
  const prevDragActive = useRef(false);

  return useCallback(
    (group: Group, delta: number, elapsed: number) => {
      const dt = Math.min(delta, MAX_DELTA);
      const idleOmega =
        BASE_SPEED *
        (1 +
          MOD1_AMP * Math.sin(MOD1_FREQ * elapsed) +
          MOD2_AMP * Math.sin(MOD2_FREQ * elapsed + MOD2_PHASE));

      const drag = dragRef?.current;
      let omega: number;
      if (drag?.active) {
        // Рука веде кут напряму; ω-конвеєр живиться її швидкістю,
        // щоб α→lag тканини реагував на ривки
        angle.current += drag.pendingAngle;
        // Свідома мутація shared-ref каналу драгу (кут спожито сценою)
        // eslint-disable-next-line react-hooks/immutability
        drag.pendingAngle = 0;
        omega = clampOmega(drag.velocity);
        prevDragActive.current = true;
      } else {
        if (prevDragActive.current) {
          // Реліз: надлишок швидкості руки стає momentum-ом
          momentum.current = clampOmega(drag?.velocity ?? 0) - idleOmega;
          prevDragActive.current = false;
        }
        momentum.current *= Math.exp(-MOMENTUM_DECAY * dt);
        omega = idleOmega + momentum.current;
        angle.current += omega * dt;
      }

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
    },
    [dragRef]
  );
};

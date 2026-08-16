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
const RETURN_DURATION = 0.12; // мʼяке повернення при скасуванні, с
const JUMP_HEIGHT_RATIO = 0.13; // апекс як частка висоти моделі
const FLIGHT_TIME = 0.35; // політ вгору + вниз, с
const STRETCH = 0.12; // розтяг у польоті на максимальній швидкості
const LANDING_AMPLITUDE = 0.12; // squash у момент удару
const LANDING_FREQ = 40; // рад/с — частота пружини приземлення
const LANDING_DAMPING = 9; // 1/с — згасання пружини
const LANDING_DURATION = 0.3; // с
const MAX_DELTA = 1 / 30; // кламп кадру після фонової вкладки

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3;

// Сплюскування по Y компенсується розширенням по X/Z — обʼєм зберігається,
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
    // Тач шле pointerleave ПІСЛЯ pointerup: відпускання вже зафіксовано,
    // стрибок має відбутись — скасовуємо лише незавершене утримання
    if (releaseQueued.current) return;
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

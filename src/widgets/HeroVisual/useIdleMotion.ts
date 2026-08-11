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
      (1 + MOD1_AMP * Math.sin(MOD1_FREQ * elapsed) + MOD2_AMP * Math.sin(MOD2_FREQ * elapsed + MOD2_PHASE));
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

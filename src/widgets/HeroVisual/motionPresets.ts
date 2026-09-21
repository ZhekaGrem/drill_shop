import type { AnimationPreset } from '@/shared/config/animation';

export type MotionPreset = AnimationPreset;

export type MotionPreview = {
  preset: MotionPreset;
  paused: boolean;
};

const TAU = Math.PI * 2;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Position is a fraction of garment height, so shirts and hoodies move equally. */
export function sampleMotion(preset: Exclude<MotionPreset, 'current'>, seconds: number) {
  const phase = ((seconds % 12) + 12) % 12;
  switch (preset) {
    case 'turntable':
      return { x: 0, y: (seconds / 12) * TAU, z: 0, lift: 0 };
    case 'showcase': {
      // Front: 0–2 s; turn: 2–4 s; back: 4–8 s; turn: 8–10 s; front: 10–12 s.
      const y =
        phase < 2
          ? 0
          : phase < 4
            ? Math.PI * smooth((phase - 2) / 2)
            : phase < 8
              ? Math.PI
              : phase < 10
                ? Math.PI + Math.PI * smooth((phase - 8) / 2)
                : TAU;
      return { x: 0, y, z: 0, lift: 0 };
    }
    case 'pendulum':
      return { x: 0, y: radians(35) * Math.sin((seconds / 8) * TAU), z: 0, lift: 0 };
    case 'float': {
      const wave = Math.sin((seconds / 8) * TAU);
      return {
        x: radians(2) * wave,
        y: radians(12) * wave,
        z: radians(1.5) * Math.sin((seconds / 8) * TAU * 2),
        lift: 0.015 * wave,
      };
    }
  }
}

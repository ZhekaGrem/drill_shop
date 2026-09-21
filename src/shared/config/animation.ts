import type { DesignId } from './design';

export type AnimationPreset = 'turntable' | 'showcase' | 'pendulum' | 'float' | 'current';

/** Follow the applied design. Cadence and anchor belong to design-rotation.ts;
 * no separate timer or storage key can drift out of sync with the palette.
 */
export const ANIMATION_BY_DESIGN = {
  diia: 'turntable',
  overdrive: 'pendulum',
  spotlight: 'float',
  monolith: 'showcase',
  cupertino: 'turntable',
  streetwear: 'current',
  tactile: 'float',
} as const satisfies Record<DesignId, AnimationPreset>;

export const ANIMATION_LABELS: Record<AnimationPreset, string> = {
  turntable: 'Чистий оберт 360°',
  showcase: 'Перед → спина',
  pendulum: 'Маятник',
  float: 'Легке зависання',
  current: 'Оберт із нахилами',
};

export const animationForDesign = (design: DesignId): AnimationPreset => ANIMATION_BY_DESIGN[design];

// src/widgets/HeroVisual/designs.ts
// Форма запису дизайну для сцени героя. Два типи записів на спільній сцені:
// — дизайн: свій basecolor (mapUrl) на дефолтній геометрії футболки;
// — модель: свій GLB (modelUrl) із запеченим у нього дизайном.
// mapUrl: undefined = запечена в GLB мапа; modelUrl: undefined = tshirt.glb.
//
// Статичного набору DESIGNS більше нема: бойові набори приходять з
// GET /collections (widgets/ProductV2/useCollections), і жоден виклик
// HeroVisual уже не покладався на дефолт. Його п'ять текстур і фолбеків
// поїхали в 3d/unused разом із рештою мертвих асетів.
/** rect: [u0, v0, u1, v1] of the chest crops in atlas UV; urls: one crop per colour. */
export type ChestCycle = { rect: number[]; urls: string[] };

export interface Design {
  label: string;
  swatch: string;
  fallback: string;
  mapUrl?: string;
  modelUrl?: string;
  /** Random chest colour: crops of the chest cycle over mapUrl (useChestCycle). */
  chestCycle?: ChestCycle;
  /** Line under the scene for random-print products («на анімації показані можливі…»). */
  printNote?: string;
  /** Procedural cloth with animated prints; still a single purchasable product. */
  presentation?: 'scarf';
}

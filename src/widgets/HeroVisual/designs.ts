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
export interface Design {
  label: string;
  swatch: string;
  fallback: string;
  mapUrl?: string;
  modelUrl?: string;
}

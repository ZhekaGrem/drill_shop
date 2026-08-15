// src/widgets/HeroVisual/designs.ts
// Конфіг перемикача героя. Два типи записів на спільній сцені:
// — дизайн: свій basecolor (mapUrl) на дефолтній геометрії футболки;
// — модель: свій GLB (modelUrl) із запеченим у нього дизайном.
// mapUrl: undefined = запечена в GLB мапа; modelUrl: undefined = tshirt.glb.
export interface Design {
  label: string;
  swatch: string;
  fallback: string;
  mapUrl?: string;
  modelUrl?: string;
}

export const DESIGNS = {
  red: {
    label: 'червоний',
    swatch: '#c8102e',
    fallback: '/assets/img/tshirt-fallback.webp?v=2',
    mapUrl: undefined,
  },
  violet: {
    label: 'фіолетовий',
    swatch: '#8b2fc9',
    fallback: '/assets/img/tshirt-fallback-violet.webp?v=3',
    mapUrl: '/3d/textures/tshirt-no-violet.jpg?v=3',
  },
  green: {
    label: 'зелений',
    swatch: '#35d221',
    fallback: '/assets/img/tshirt-fallback-green.webp?v=2',
    mapUrl: '/3d/textures/tshirt-no-green.jpg?v=2',
  },
  yellow: {
    label: 'жовтий',
    swatch: '#f5d800',
    fallback: '/assets/img/tshirt-fallback-yellow.webp?v=2',
    mapUrl: '/3d/textures/tshirt-no-yellow.jpg?v=2',
  },
  runic: {
    label: 'рунічний',
    swatch: '#74ad40',
    fallback: '/assets/img/tshirt-fallback-runic.webp?v=2',
    mapUrl: '/3d/textures/tshirt-no-runic.jpg?v=2',
  },
  whiteViolet: {
    label: 'білий з фіолетовим',
    swatch: '#f4f2f7',
    fallback: '/assets/img/tshirt-fallback-white-violet.webp?v=2',
    mapUrl: '/3d/textures/tshirt-no-white-violet.jpg?v=2',
  },
} as const satisfies Record<string, Design>;

export type DesignKey = keyof typeof DESIGNS;

// Дефолтний набір лишився ЛИШЕ як фолбек HeroVisual — бойові набори
// приходять з GET /collections (widgets/ProductV2/useCollections).

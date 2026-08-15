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

// Прибрані з героя 1 (рішення власника, 2026-08-15), але живі для інших
// героїв: магазинного (rockDepartament, greenScratch) і тест-колекції (моделі)
export const EXTRA_DESIGNS = {
  rockDepartament: {
    label: 'рок департамент',
    swatch: 'conic-gradient(from -45deg, #303030 0 55%, #a0a0a0 55% 100%)',
    fallback: '/assets/img/tshirt-fallback-rock-departament.webp',
    mapUrl: '/3d/textures/tshirt-rock-departament.jpg',
  },
  hoodie: {
    label: 'худі',
    swatch: 'conic-gradient(from -45deg, #101010 0 55%, #f0f0f0 55% 100%)',
    fallback: '/assets/img/hoodie-fallback.webp',
    mapUrl: undefined,
    modelUrl: '/3d/models/hoodie.glb?v=2',
  },
  walking: {
    label: 'walking-футболка, чорна НО',
    swatch: 'conic-gradient(from -45deg, #404040 0 55%, #a03050 55% 100%)',
    fallback: '/assets/img/walking-fallback.webp',
    mapUrl: undefined,
    modelUrl: '/3d/models/tshirt-walking.glb?v=2',
  },
  hanger: {
    label: 'на вішаку (мармур)',
    swatch: 'conic-gradient(from -45deg, #808080 0 55%, #c0c0c0 55% 100%)',
    fallback: '/assets/img/hanger-fallback.webp',
    mapUrl: undefined,
    modelUrl: '/3d/models/tshirt-hanger.glb?v=2',
  },
  greenScratch: {
    label: 'зелена скретч',
    swatch: '#309040',
    fallback: '/assets/img/tshirt-fallback-green-scratch.webp',
    mapUrl: '/3d/textures/tshirt-green-scratch.jpg',
  },
} as const satisfies Record<string, Design>;

// Колекція «Дріл» для другого героя: 16 дизайнів, тканини лише білі/чорні,
// тож свотчі — ідентифікатори, не кольори тканини (тепла палітра = дріл 1,
// холодна = дріл 2). Правда про дизайн — у label.
const drilEntry = (set: 1 | 2, n: number, fabric: 'біла' | 'чорна', swatch: string): Design => ({
  label: `дріл ${set} · 0${n} (${fabric})`,
  swatch,
  fallback: `/assets/img/tshirt-fallback-dril${set}-0${n}.webp`,
  mapUrl: `/3d/textures/tshirt-dril${set}-0${n}.jpg`,
});

// Тестова колекція (герой 4): різнорідні предмети — дизайни й моделі впереміш,
// перемикач із міні-фото (switcher="thumbs" у HeroVisual)
export const TEST_COLLECTION: Record<string, Design> = {
  red: DESIGNS.red,
  violet: DESIGNS.violet,
  hoodie: EXTRA_DESIGNS.hoodie,
  walking: EXTRA_DESIGNS.walking,
  hanger: EXTRA_DESIGNS.hanger,
};

export const DRIL_DESIGNS: Record<string, Design> = {
  d101: drilEntry(1, 1, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #808080 55% 100%)'),
  d102: drilEntry(1, 2, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #a05050 55% 100%)'),
  d103: drilEntry(
    1,
    3,
    'біла',
    'conic-gradient(from -45deg, #d0d0d0 0 50%, #a03040 50% 78%, #808080 78% 100%)'
  ),
  d104: drilEntry(1, 4, 'чорна', 'conic-gradient(from -45deg, #404040 0 55%, #d05060 55% 100%)'),
  d105: drilEntry(1, 5, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #909090 55% 100%)'),
  d106: drilEntry(1, 6, 'чорна', '#404040'),
  d107: drilEntry(1, 7, 'чорна', 'conic-gradient(from -45deg, #404040 0 55%, #e05060 55% 100%)'),
  d108: drilEntry(1, 8, 'чорна', '#404040'),
  d201: drilEntry(2, 1, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #202020 55% 100%)'),
  d202: drilEntry(
    2,
    2,
    'біла',
    'conic-gradient(from -45deg, #d0d0d0 0 50%, #a03040 50% 78%, #808080 78% 100%)'
  ),
  d203: drilEntry(2, 3, 'чорна', 'conic-gradient(from -45deg, #404040 0 55%, #808080 55% 100%)'),
  d204: drilEntry(2, 4, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #b08070 55% 100%)'),
  d205: drilEntry(2, 5, 'чорна', 'conic-gradient(from -45deg, #404040 0 55%, #a05050 55% 100%)'),
  d206: drilEntry(2, 6, 'біла', 'conic-gradient(from -45deg, #d0d0d0 0 55%, #202020 55% 100%)'),
  d207: drilEntry(
    2,
    7,
    'чорна',
    'conic-gradient(from -45deg, #404040 0 50%, #f0c0b0 50% 78%, #e06060 78% 100%)'
  ),
  d208: drilEntry(2, 8, 'чорна', 'conic-gradient(from -45deg, #404040 0 55%, #b05050 55% 100%)'),
};

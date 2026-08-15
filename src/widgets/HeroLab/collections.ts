// src/widgets/HeroLab/collections.ts
// ТИМЧАСОВО: дані для лабораторії перемикання МІЖ колекціями (героями).
// Колекції — три наявні конфіги дизайнів + копі героїв із content.
import { DESIGNS, DRIL_DESIGNS, TEST_COLLECTION } from '@/widgets/HeroVisual/designs';
import type { Design } from '@/widgets/HeroVisual/designs';
import { content } from '@/shared/config/content';

export interface HeroCollection {
  key: string;
  title: string;
  description: string;
  designs: Record<string, Design>;
}

export const HERO_COLLECTIONS: HeroCollection[] = [
  {
    key: 'oksana',
    title: content.home.hero.title,
    description: content.home.hero.description,
    designs: DESIGNS,
  },
  {
    key: 'dril',
    title: content.home.hero2.title,
    description: content.home.hero2.description,
    designs: DRIL_DESIGNS,
  },
  {
    key: 'test',
    title: content.home.heroTest.title,
    description: content.home.heroTest.description,
    designs: TEST_COLLECTION,
  },
];

/** Обкладинка колекції — фолбек її першого дизайну */
export const coverOf = (col: HeroCollection): string => Object.values(col.designs)[0].fallback;

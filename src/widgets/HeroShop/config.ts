// src/widgets/HeroShop/config.ts
// Комерційний герой: дизайн у 3D-перемикачі ↔ товар магазину (slug бекенда).
// Лише texture-свопи одного крою — моделі (худі/вішак/walking) не продаються
// цим героєм. Мапу звірено з живим каталогом 2026-08-13.
import { DESIGNS, EXTRA_DESIGNS } from '@/widgets/HeroVisual/designs';
import type { Design } from '@/widgets/HeroVisual/designs';

// Герой 1 схуд до 6 дизайнів, але магазинний герой продає і прибрані звідти
// (rockDepartament, greenScratch) — тому шукаємо в обʼєднаному словнику
const ALL_DESIGNS = { ...DESIGNS, ...EXTRA_DESIGNS };

const PICK = {
  red: 'red-oxana',
  violet: 'nizhna-viloet',
  green: 't-shirt-black-green',
  yellow: 't-shirt-black-yellow-oksana',
  runic: 'nirvana-runic',
  whiteViolet: 'oxana-white-violet',
  rockDepartament: 'nizhna-oksana-rock-black-list',
  greenScratch: 'nizhna-runic-dril-green',
} as const;

export type Hero3Key = keyof typeof PICK;
export const HERO3_SLUGS: Record<Hero3Key, string> = PICK;

export const HERO3_DESIGNS: Record<string, Design> = Object.fromEntries(
  (Object.keys(PICK) as Hero3Key[]).map((key) => [key, ALL_DESIGNS[key]])
);

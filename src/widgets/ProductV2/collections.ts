// src/widgets/ProductV2/collections.ts
// Реєстр колекцій для v2-сторінок. Поки з фронтових конфігів; після міграції
// БД (спека collections-db-design) джерелом стане GET /collections, а форма
// даних лишиться тією самою.
import { DRIL_DESIGNS, TEST_COLLECTION } from '@/widgets/HeroVisual/designs';
import type { Design } from '@/widgets/HeroVisual/designs';
import { HERO3_DESIGNS, HERO3_SLUGS } from '@/widgets/HeroShop/config';
import type { Hero3Key } from '@/widgets/HeroShop/config';
import { content } from '@/shared/config/content';

export interface CollectionItem {
  key: string;
  slug: string;
  design: Design;
}

export interface CollectionDef {
  key: string;
  title: string;
  description: string;
  designs: Record<string, Design>;
  /** Товари з реальними slug (порожньо, поки колекція не зв'язана з каталогом) */
  items: CollectionItem[];
  cover: string;
  /** Куди веде картка «інші колекції» */
  href: string;
}

const oksanaItems: CollectionItem[] = (Object.entries(HERO3_SLUGS) as [Hero3Key, string][]).map(
  ([key, slug]) => ({ key, slug, design: HERO3_DESIGNS[key] })
);

const coverOf = (designs: Record<string, Design>) => Object.values(designs)[0].fallback;

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'oksana',
    title: content.home.hero.title,
    description: content.home.hero.description,
    designs: HERO3_DESIGNS,
    items: oksanaItems,
    cover: coverOf(HERO3_DESIGNS),
    href: `/v2/a/${oksanaItems[0].slug}`,
  },
  {
    key: 'dril',
    title: content.home.hero2.title,
    description: content.home.hero2.description,
    designs: DRIL_DESIGNS,
    // Пари дизайн→товар ще не звірені з каталогом — картка веде в каталог
    items: [],
    cover: coverOf(DRIL_DESIGNS),
    href: '/catalog',
  },
  {
    key: 'test',
    title: content.home.heroTest.title,
    description: content.home.heroTest.description,
    designs: TEST_COLLECTION,
    items: [],
    cover: coverOf(TEST_COLLECTION),
    href: '/catalog',
  },
];

/** Колекція, якій належить товар (за slug); дефолт — перша */
export const collectionOfSlug = (slug: string): CollectionDef =>
  COLLECTIONS.find((c) => c.items.some((i) => i.slug === slug)) ?? COLLECTIONS[0];

export const itemBySlug = (slug: string): CollectionItem | undefined =>
  COLLECTIONS.flatMap((c) => c.items).find((i) => i.slug === slug);

export const otherCollections = (currentKey: string): CollectionDef[] =>
  COLLECTIONS.filter((c) => c.key !== currentKey);

// Сумісність зі старими v2-сторінками B/C (демо-репрезентації)
export const COLLECTION_INFO = { title: COLLECTIONS[0].title, description: COLLECTIONS[0].description };
export const COLLECTION_ITEMS = oksanaItems;

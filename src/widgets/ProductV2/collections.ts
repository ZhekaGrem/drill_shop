// src/widgets/ProductV2/collections.ts
// Форма колекції для UI (герой, сторінка колекції, «інші колекції») і чисті
// хелпери пошуку. Дані приходять із GET /collections (useCollections) —
// статичного реєстру більше нема, правда живе в БД.
import type { Design } from '@/widgets/HeroVisual/designs';

export interface CollectionItem {
  key: string;
  slug: string;
  design: Design;
}

export interface CollectionDef {
  key: string;
  title: string;
  description: string;
  /** Архівна колекція: вітрина без продажу (дата закриття дропу) */
  archivedAt: string | null;
  designs: Record<string, Design>;
  items: CollectionItem[];
  cover: string;
  /** Куди веде картка «інші колекції» */
  href: string;
}

/** Колекція, якій належить товар (за slug); дефолт — перша */
export const collectionOfSlug = (
  collections: CollectionDef[] | undefined,
  slug: string
): CollectionDef | undefined =>
  collections?.find((c) => c.items.some((i) => i.slug === slug)) ?? collections?.[0];

export const itemBySlug = (
  collections: CollectionDef[] | undefined,
  slug: string
): CollectionItem | undefined => collections?.flatMap((c) => c.items).find((i) => i.slug === slug);

export const otherCollections = (
  collections: CollectionDef[] | undefined,
  currentKey: string | undefined
): CollectionDef[] => (collections ?? []).filter((c) => c.key !== currentKey);

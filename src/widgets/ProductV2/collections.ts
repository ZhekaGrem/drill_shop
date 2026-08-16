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
  /** Капсула-лейбл колекції («новинка» в кольоровій пігулці біля назви) */
  labelText: string | null;
  labelColor: string | null;
  /** Пульсуюча крапка колекції (тихий підпис на герої) */
  badgeText: string | null;
  badgeColor: string | null;
  designs: Record<string, Design>;
  items: CollectionItem[];
  cover: string;
  /** Куди веде картка «інші колекції» */
  href: string;
}

/** Колекція, якій належить товар (за slug).
 *  Фолбека «перша колекція» тут БУТИ НЕ МОЖЕ. Він був, і для невідомого slug
 *  сцена показувала перший товар чужої колекції, тоді як панель покупки продавала
 *  товар за slug — людина дивилась на одну річ, а купувала іншу. */
export const collectionOfSlug = (
  collections: CollectionDef[] | undefined,
  slug: string
): CollectionDef | undefined => collections?.find((c) => c.items.some((i) => i.slug === slug));

export const itemBySlug = (
  collections: CollectionDef[] | undefined,
  slug: string
): CollectionItem | undefined => collections?.flatMap((c) => c.items).find((i) => i.slug === slug);

/** Стиль капсули-лейбла: фон приходить із БД (hex АБО градієнт — напр.
 *  var(--gradient-brand)); бренд-градієнт світлий, тому текст на ньому
 *  темний, а на суцільних кольорах — білий. */
export const capsuleStyle = (labelColor: string | null) => {
  const background = labelColor ?? '#3b6ff5';
  return { background, color: background.includes('gradient') ? '#101413' : '#fff' };
};

export const otherCollections = (
  collections: CollectionDef[] | undefined,
  currentKey: string | undefined
): CollectionDef[] => (collections ?? []).filter((c) => c.key !== currentKey);

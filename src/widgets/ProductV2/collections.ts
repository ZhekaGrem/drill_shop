// src/widgets/ProductV2/collections.ts
// Форма колекції для UI (герой, сторінка колекції, «інші колекції») і чисті
// хелпери пошуку. Дані приходять із GET /collections (useCollections) —
// статичного реєстру більше нема, правда живе в БД.
import type { CSSProperties } from 'react';
import type { Design } from '@/widgets/HeroVisual/designs';
import type { DesignId } from '@/shared/config/design';
import { isHiddenCollection } from '@/shared/config/hidden-collections';

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
 *  темний, а на суцільних кольорах — білий.
 *
 *  К2/К3 перефарбовують .designCapsule повністю самі (globals.css,
 *  [data-design='streetwear'|'tactile'] .designCapsule) — раніше той CSS
 *  бив по інлайн-style через !important (заборонено DESIGN_SYSTEM.md:374,
 *  бо інакше інлайн-style не перебити нічим, крім нього). Правильний фікс —
 *  не класти інлайн узагалі, коли скін і так візьме капсулу на себе: тоді
 *  нема з чим битись, і звичайна специфічність класу вирішує сама. */
export const capsuleStyle = (labelColor: string | null, design?: DesignId): CSSProperties | undefined => {
  if (design === 'streetwear' || design === 'tactile') return undefined;
  const background = labelColor ?? '#3b6ff5';
  return { background, color: background.includes('gradient') ? '#101413' : '#fff' };
};

// Приховані розділи не рекламуються в «Інших колекціях» — туди ведуть
// лише прямі лінки (на сторінці самого прихованого розділу currentKey
// і так виключає його зі списку)
export const otherCollections = (
  collections: CollectionDef[] | undefined,
  currentKey: string | undefined
): CollectionDef[] => (collections ?? []).filter((c) => c.key !== currentKey && !isHiddenCollection(c.key));

'use client';
// src/widgets/CollectionGrid/CollectionGrid.tsx
// Усі товари колекції картками каталогу — для розділу, де дизайнів забагато для перемикача
// героя (/zlypni: сто футболок і сто худі). Розмір і «в кошик» — просто на картці, а сама
// картка веде на 3D-сторінку товару, як і кнопка героя.
//
// Сто карток одразу — це сотня фото й десятки екранів прокрутки на телефоні, тож спершу
// FIRST, а далі «Показати ще» по STEP.
import { useState } from 'react';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { Button } from '@/shared/components/Button/Button';
import { formatCount } from '@/shared/utils/format';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import styles from './CollectionGrid.module.scss';

const FIRST = 12;
const STEP = 24;

interface CollectionGridProps {
  collection: CollectionDef;
  /** Форми слова для лічильника: ['дизайн', 'дизайни', 'дизайнів'] */
  countWords: [string, string, string];
}

export const collectionGridId = (key: string) => `grid-${key}`;

export const CollectionGrid = ({ collection, countWords }: CollectionGridProps) => {
  const [shown, setShown] = useState(FIRST);
  const id = collectionGridId(collection.key);
  const rest = collection.items.length - shown;
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>
          {collection.title}
        </h2>
        <p className={styles.count}>{formatCount(collection.items.length, countWords)}</p>
      </header>
      <div className={styles.grid} data-win98-grid="">
        {collection.items.slice(0, shown).map((item, index) => (
          <ProductCard key={item.key} product={item.card} href={`/v2/a/${item.slug}`} index={index} />
        ))}
      </div>
      {rest > 0 && (
        <div className={styles.more}>
          <Button variant="outline" size="lg" onClick={() => setShown((n) => n + STEP)}>
            Показати ще {Math.min(STEP, rest)} · залишилось {rest}
          </Button>
        </div>
      )}
    </section>
  );
};

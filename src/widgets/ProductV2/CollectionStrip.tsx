// src/widgets/ProductV2/CollectionStrip.tsx
// Горизонтальна стрічка товарів колекції (мініатюри-фолбеки): контекст
// «ти в колекції» + перемикання товару без повернення на головну.
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { COLLECTION_ITEMS } from './collections';
import styles from './ProductV2.module.scss';

export const CollectionStrip = ({ activeSlug, version }: { activeSlug: string; version: string }) => {
  const router = useRouter();
  return (
    <div className={styles.strip} role="group" aria-label="Товари колекції">
      {COLLECTION_ITEMS.map((item) => (
        <button
          key={item.slug}
          type="button"
          className={styles.stripThumb}
          aria-pressed={item.slug === activeSlug}
          aria-label={item.design.label}
          onClick={() => router.push(`/v2/${version}/${item.slug}`)}>
          <Image src={item.design.fallback} alt="" width={56} height={56} loading="lazy" />
        </button>
      ))}
    </div>
  );
};

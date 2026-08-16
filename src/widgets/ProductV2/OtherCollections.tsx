// src/widgets/ProductV2/OtherCollections.tsx
// «Інші колекції» під товаром: картки з обкладинкою і кількістю дизайнів.
// Дані — з GET /collections; коли колекція одна, секція не рендериться.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/shared/components/Section/Section';
import { otherCollections } from './collections';
import type { CollectionDef } from './collections';
import styles from './ProductV2.module.scss';

// Форму обирає ОСТАННЯ цифра, а не саме число: умова `n < 5` давала
// «22 дизайнів» замість «22 дизайни». Другий виняток — 11-14, де завжди
// родовий множини.
const plural = (n: number) => {
  const last = n % 10;
  const teen = n % 100;
  if (teen >= 11 && teen <= 14) return 'дизайнів';
  if (last === 1) return 'дизайн';
  if (last >= 2 && last <= 4) return 'дизайни';
  return 'дизайнів';
};

export const OtherCollections = ({
  collections,
  currentKey,
}: {
  collections: CollectionDef[] | undefined;
  currentKey: string | undefined;
}) => {
  const others = otherCollections(collections, currentKey);
  if (others.length === 0) return null;

  return (
    <Section title="Інші колекції" action={{ href: '/catalog', label: 'Весь каталог' }}>
      <div className={styles.collectionCards}>
        {others.map((col) => {
          const count = col.items.length;
          return (
            <Link key={col.key} href={col.href} className={styles.collectionCard}>
              <Image src={col.cover} alt="" width={160} height={160} loading="lazy" />
              <span className={styles.collectionCardBody}>
                <strong>{col.title}</strong>
                <span className={styles.collectionCardHint}>
                  {count} {plural(count)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

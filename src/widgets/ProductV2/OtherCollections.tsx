// src/widgets/ProductV2/OtherCollections.tsx
// «Інші колекції» під товаром: картки колекцій з обкладинкою і кількістю
// дизайнів. Колекція, яка ще не зв'язана з каталогом, веде в каталог —
// чесно, без обіцянки сторінки, якої нема.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/shared/components/Section/Section';
import { otherCollections } from './collections';
import styles from './ProductV2.module.scss';

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'дизайн' : n < 5 ? 'дизайни' : 'дизайнів');

export const OtherCollections = ({ currentKey }: { currentKey: string }) => {
  const collections = otherCollections(currentKey);
  if (collections.length === 0) return null;

  return (
    <Section title="Інші колекції" action={{ href: '/catalog', label: 'Весь каталог' }}>
      <div className={styles.collectionCards}>
        {collections.map((col) => {
          const count = Object.keys(col.designs).length;
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

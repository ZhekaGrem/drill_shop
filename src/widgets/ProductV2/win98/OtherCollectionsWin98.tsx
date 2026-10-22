// src/widgets/ProductV2/win98/OtherCollectionsWin98.tsx
// «Іньчі колекції» у дизайні Windows 98: окреме вікно, назва — у синій смузі (h2), «Весь каталог» — кнопка в тій
// самій смузі. Дизайни до Windows користуються незмінним ../OtherCollections.tsx.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Windows98WindowBar } from '@/shared/components/Windows98/Windows98';
import { capsuleStyle, otherCollections } from '../collections';
import type { CollectionDef } from '../collections';
import styles from './ProductV2Win98.module.scss';

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

export const OtherCollectionsWin98 = ({
  collections,
  currentKey,
}: {
  collections: CollectionDef[] | undefined;
  currentKey: string | undefined;
}) => {
  const others = otherCollections(collections, currentKey);
  if (others.length === 0) return null;

  const cards = (
    <div className={styles.collectionCards}>
      {others.map((col) => {
        const count = col.items.length;
        return (
          <Link key={col.key} href={col.href} className={styles.collectionCard}>
            <Image src={col.cover} alt="" width={160} height={160} loading="lazy" />
            <span className={styles.collectionCardBody}>
              {/* Дані для капсули/крапки/архівної позначки вже приходять із
                    GET /collections — раніше картка їх просто не малювала, і
                    архівна колекція виглядала так само, як активна. */}
              <span className={styles.collectionCardTitle}>
                <strong>{col.title}</strong>
                {col.labelText && (
                  <span
                    className={`${styles.capsule} designCapsule`}
                    style={capsuleStyle(col.labelColor, 'win98')}>
                    {col.labelText}
                  </span>
                )}
              </span>
              {col.badgeText && (
                <span className={styles.badgeDot}>
                  <span
                    className={styles.pulseDot}
                    // Той самий фікс, що й на сторінці товару: жодного hex у
                    // компоненті (правило проєкту), а не контраст — крапка
                    // aria-hidden і дублює текст поруч, тож рахується WCAG
                    // 1.4.11 (нетекстовий контраст, 3:1), не 1.4.3. #1c8a37
                    // проходить 3:1 (4.43:1 удень / 3.60:1 уночі) так само,
                    // як і токен.
                    style={{ '--badge-color': col.badgeColor ?? 'var(--success-green)' } as CSSProperties}
                    aria-hidden="true"
                  />
                  {col.badgeText}
                </span>
              )}
              {col.archivedAt && <span className={styles.outOfStock}>Архівна колекція</span>}
              <span className={styles.collectionCardHint}>
                {count} {plural(count)}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <section className={`${styles.card} ${styles.otherWindow}`} data-store-window="">
      <Windows98WindowBar
        as="h2"
        title="Іньчі колекції"
        action={
          <Link href="/catalog" data-win98-bar-button="">
            Весь каталог
          </Link>
        }
      />
      {cards}
    </section>
  );
};

// src/widgets/HomeHeroes/HomeHeroes.tsx
// Герої головної: колекції з БД у механіці активної дизайн-концепції
// (/v2/dev → data-design). Дія — стек, К1 — peek-карусель, К2 — плитки зі
// сторіз, К3 — таби. Вибраний дизайн зберігається окремо на колекцію і
// переживає перемикання механік.
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { useDesign } from '@/shared/hooks';
import { content } from '@/shared/config/content';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroBlock } from './HeroBlock';
import { HeroCarousel } from './HeroCarousel';
import { HeroTabs } from './HeroTabs';
import { HeroTiles } from './HeroTiles';
import styles from './HomeHeroes.module.scss';

interface HomeHeroesProps {
  collections?: CollectionDef[];
  /** Кнопка «Про бренд» у першого героя. Веде на сторінку Дріла, тож
   *  на сторінці автора (/polamav) її нема. */
  showAbout?: boolean;
  /** Текст скелетона, поки колекції вантажаться */
  intro?: { title: string; description: string };
}

export const HomeHeroes = ({ collections, showAbout = true, intro = content.home.hero }: HomeHeroesProps) => {
  const design = useDesign();
  const [selected, setSelected] = useState<Record<string, string>>({});

  // Скелетон, поки GET /collections не відповів (без стрибка макета)
  if (!collections?.length) {
    return (
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>{intro.title}</h1>
          <p className={styles.heroSubtitle}>{intro.description}</p>
          <div className={styles.heroActions}>
            <Button size="lg" variant="primary" disabled>
              До колекції <ArrowRight size={20} />
            </Button>
          </div>
        </div>
        <div className={styles.heroStageSkeleton} aria-busy="true" aria-label="Завантаження колекцій" />
      </section>
    );
  }

  const activeOf = (col: CollectionDef) => selected[col.key] ?? col.items[0]?.slug;
  const pick = (colKey: string) => (slug: string) => setSelected((prev) => ({ ...prev, [colKey]: slug }));

  const mechanics = { collections, activeOf, pick, showAbout };
  if (design === 'cupertino') return <HeroCarousel {...mechanics} />;
  if (design === 'streetwear') return <HeroTiles collections={collections} activeOf={activeOf} pick={pick} />;
  if (design === 'tactile') return <HeroTabs {...mechanics} />;

  return (
    <>
      {collections.map((col, i) => (
        <HeroBlock
          key={col.key}
          col={col}
          titleTag={i === 0 ? 'h1' : 'h2'}
          active={activeOf(col)}
          onPick={pick(col.key)}
          showAbout={showAbout && i === 0}
        />
      ))}
    </>
  );
};

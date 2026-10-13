// src/widgets/HomeHeroes/HomeHeroes.tsx
// Герої головної: колекції з БД у механіці активної дизайн-концепції
// (/v2/dev → data-design). Дія — стек, К1 — peek-карусель, К2 — плитки зі
// сторіз, К3 — таби. Вибраний дизайн зберігається окремо на колекцію і
// переживає перемикання механік.
'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { readHeroSelection, writeHeroSelection } from './hero-links';
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

  const [ready, setReady] = useState(false);
  const [focusKey, setFocusKey] = useState<string>();
  useLayoutEffect(() => {
    if (!collections?.length) return;
    const restore = () => {
      const url = new URL(window.location.href);
      setSelected(readHeroSelection(url, collections));
      setFocusKey(collections.find((col) => url.hash === `#collection-${col.key}`)?.key);
      setReady(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, [collections]);

  useEffect(() => {
    if (!ready || !focusKey) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`collection-${focusKey}`)?.scrollIntoView({ block: 'start', inline: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, focusKey, design]);

  // Скелетон, поки GET /collections не відповів (без стрибка макета)
  if (!collections?.length || !ready) {
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
  const pick = (colKey: string) => (slug: string) => {
    const next = { ...selected, [colKey]: slug };
    setSelected(next);
    const url = writeHeroSelection(new URL(window.location.href), collections, next);
    window.history.replaceState(window.history.state, '', url);
  };
  const share = async (colKey: string) => {
    const url = writeHeroSelection(new URL(window.location.href), collections, selected, colKey);
    await navigator.clipboard.writeText(url.href);
  };

  const mechanics = { collections, activeOf, pick, showAbout, share, focusKey };
  if (design === 'cupertino') return <HeroCarousel key={focusKey} {...mechanics} />;
  if (design === 'streetwear') return <HeroTiles key={focusKey} {...mechanics} />;
  if (design === 'tactile') return <HeroTabs key={focusKey} {...mechanics} />;

  return (
    <>
      {collections.map((col, i) => (
        <HeroBlock
          key={col.key}
          col={col}
          titleTag={i === 0 ? 'h1' : 'h2'}
          active={activeOf(col)}
          onPick={pick(col.key)}
          onShare={() => share(col.key)}
          showAbout={showAbout && i === 0}
        />
      ))}
    </>
  );
};

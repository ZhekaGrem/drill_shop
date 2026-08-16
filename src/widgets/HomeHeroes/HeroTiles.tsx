// src/widgets/HomeHeroes/HeroTiles.tsx
// К2 Стрітвір: кольорові плитки колекцій (колір = перший свотч, поки в БД
// нема tile_color) + сторіз-бари з автогортанням 5с. Тап по плитці — вибір
// і пауза 15с; будь-який дотик до героя — теж пауза (щоб автогортання не
// виривало сцену з-під пальця); prefers-reduced-motion вимикає авто зовсім.
'use client';

import { useEffect, useRef, useState } from 'react';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroBlock } from './HeroBlock';
import styles from './HomeHeroes.module.scss';

const AUTOPLAY_MS = 5000;
const INTERACTION_PAUSE_MS = 15000;

// Поза компонентом: правило purity не пускає Date.now() у render-замикання,
// а це виключно обробникова логіка — штампуємо дедлайн паузи тут
const stampPause = (ref: { current: number }) => {
  ref.current = Date.now() + INTERACTION_PAUSE_MS;
};

export const HeroTiles = ({
  collections,
  activeOf,
  pick,
}: {
  collections: CollectionDef[];
  activeOf: (col: CollectionDef) => string;
  pick: (colKey: string) => (slug: string) => void;
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  // generation перезапускає CSS-анімацію бара і при повторному колі
  const [generation, setGeneration] = useState(0);
  const pausedUntil = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = setInterval(() => {
      if (reduced.current || Date.now() < pausedUntil.current) return;
      setActiveIdx((i) => (i + 1) % collections.length);
      setGeneration((g) => g + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(tick);
  }, [collections.length]);

  const pause = () => stampPause(pausedUntil);

  const choose = (i: number) => {
    setActiveIdx(i);
    setGeneration((g) => g + 1);
    pause();
  };

  const col = collections[activeIdx] ?? collections[0];
  if (!col) return null;

  return (
    <section className={styles.tilesHero}>
      <div className={styles.storyBars} aria-hidden="true">
        {collections.map((c, i) => (
          <span key={c.key} className={styles.storyBar}>
            {i === activeIdx && <span key={generation} className={styles.storyBarFill} />}
            {i < activeIdx && <span className={styles.storyBarDone} />}
          </span>
        ))}
      </div>
      <div className={styles.tilesRow} role="tablist" aria-label="Колекції">
        {collections.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={i === activeIdx}
            className={i === activeIdx ? styles.tileActive : styles.tile}
            style={{ '--tile-color': c.items[0]?.design.swatch ?? '#666' } as React.CSSProperties}
            onClick={() => choose(i)}>
            <span className={styles.tileSwatch} aria-hidden="true" />
            <span className={styles.tileLabel}>{c.title}</span>
          </button>
        ))}
      </div>
      <div onPointerDownCapture={pause}>
        <HeroBlock col={col} titleTag="h1" active={activeOf(col)} onPick={pick(col.key)} />
      </div>
    </section>
  );
};

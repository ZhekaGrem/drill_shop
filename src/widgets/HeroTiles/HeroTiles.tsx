// src/widgets/HeroTiles/HeroTiles.tsx
// Герой із плитками-колекціями (механіка власника, 2026-08-14): кольорові
// квадрати з назвами колекцій, під кожним сторіз-смужка 5с. Автогортання по
// колу; клік по плитці — ручний вибір (таймер стартує заново). Нижче — живий
// герой активної колекції (3D + перемикач дизайнів).
// Дані тимчасово з демо-конфіга HeroLab; у проді — з GET /collections.
'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { HERO_COLLECTIONS } from '@/widgets/HeroLab/collections';
import styles from './HeroTiles.module.scss';

// Колір плитки колекції (поки конфіг; у проді — поле колекції з БД)
const TILE_COLORS: Record<string, string> = {
  oksana: '#c8102e',
  dril: '#1b1b1b',
  test: '#309040',
};

export const HeroTiles = () => {
  const [active, setActive] = useState(0);
  const total = HERO_COLLECTIONS.length;

  // Сторіз: через 5с — наступна колекція; будь-яка зміна active рестартить
  useEffect(() => {
    const id = setTimeout(() => setActive((v) => (v + 1) % total), 5000);
    return () => clearTimeout(id);
  }, [active, total]);

  const col = HERO_COLLECTIONS[active];

  return (
    <section className={styles.hero} aria-label="Колекції">
      <div className={styles.tiles}>
        {HERO_COLLECTIONS.map((c, idx) => (
          <div key={c.key} className={styles.tileWrap}>
            <button
              type="button"
              className={styles.tile}
              style={{ '--tile-color': TILE_COLORS[c.key] } as CSSProperties}
              aria-pressed={idx === active}
              onClick={() => setActive(idx)}>
              {c.title}
            </button>
            <span className={styles.bar}>
              <span
                key={`${idx}-${active}`}
                className={styles.fill}
                style={{ '--tile-color': TILE_COLORS[c.key] } as CSSProperties}
                data-active={idx === active}
                data-done={idx < active}
              />
            </span>
          </div>
        ))}
      </div>

      <div className={styles.copy}>
        <h2>{col.title}</h2>
        <p>{col.description}</p>
      </div>

      <HeroVisual key={col.key} designs={col.designs} switcher="thumbs" />
    </section>
  );
};

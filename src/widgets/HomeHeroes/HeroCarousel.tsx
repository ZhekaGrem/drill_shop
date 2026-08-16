// src/widgets/HomeHeroes/HeroCarousel.tsx
// К1 Cupertino: peek-карусель колекцій — горизонтальний scroll-snap по
// центру, сусідні картки визирають з країв. Жива 3D-сцена лише в картки
// у фокусі (IO ≥60% в межах треку), бічні показують постер — WebGL-контекст
// один. Свайп по сцені крутить футболку (drag-обробники сцени), по краях —
// гортає карусель (нативний скрол контейнера).
'use client';

import { useEffect, useRef, useState } from 'react';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroBlock } from './HeroBlock';
import styles from './HomeHeroes.module.scss';

interface HeroCarouselProps {
  collections: CollectionDef[];
  activeOf: (col: CollectionDef) => string;
  pick: (colKey: string) => (slug: string) => void;
}

export const HeroCarousel = ({ collections, activeOf, pick }: HeroCarouselProps) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [centered, setCentered] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCentered(cards.indexOf(entry.target));
        }
      },
      { root: track, threshold: 0.6 }
    );
    cards.forEach((card) => io.observe(card));
    return () => io.disconnect();
  }, [collections.length]);

  return (
    <section className={styles.carousel} aria-roledescription="карусель колекцій">
      <ul ref={trackRef} className={styles.carouselTrack}>
        {collections.map((col, i) => (
          <li key={col.key} className={styles.carouselCard} aria-hidden={i !== centered}>
            <HeroBlock
              col={col}
              titleTag={i === 0 ? 'h1' : 'h2'}
              active={activeOf(col)}
              onPick={pick(col.key)}
              showAbout={i === 0}
              live={i === centered}
            />
          </li>
        ))}
      </ul>
      <div className={styles.carouselDots} aria-hidden="true">
        {collections.map((col, i) => (
          <span key={col.key} className={i === centered ? styles.carouselDotActive : styles.carouselDot} />
        ))}
      </div>
    </section>
  );
};

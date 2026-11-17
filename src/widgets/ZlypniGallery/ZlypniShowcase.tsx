'use client';
// src/widgets/ZlypniGallery/ZlypniShowcase.tsx
// Одна колекція галереї: 3D-сцена з компасом, а під нею всі дизайни сіткою. Сто дизайнів компасом
// не передивишся, тож сітка — головний вхід: картка не веде на товар (його нема), а ставить дизайн
// на сцену й прокручує до неї.
//
// Сто постерів одразу — це десятки екранів прокрутки на телефоні, тож спершу FIRST, далі по STEP.
import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/Button/Button';
import { content } from '@/shared/config/content';
import type { ZlypniCollection } from '@/shared/config/zlypni';
import { formatCount } from '@/shared/utils/format';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import type { Design } from '@/widgets/HeroVisual/designs';
import styles from './ZlypniGallery.module.scss';

const FIRST = 12;
const STEP = 24;

export const ZlypniShowcase = ({ collection }: { collection: ZlypniCollection }) => {
  const designs = useMemo(
    () =>
      Object.fromEntries(
        collection.designs.map((d): [string, Design] => [
          d.key,
          {
            label: d.name,
            swatch: '#cccccc',
            fallback: d.poster,
            mapUrl: d.texture,
            modelUrl: collection.modelUrl,
          },
        ])
      ),
    [collection]
  );
  const [active, setActive] = useState(collection.designs[0].key);
  const [shown, setShown] = useState(FIRST);
  const stageRef = useRef<HTMLDivElement>(null);
  const id = `zlypni-${collection.key}`;
  const rest = collection.designs.length - shown;

  const show = (key: string) => {
    setActive(key);
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>
          {collection.title}
        </h2>
        <p className={styles.count}>{formatCount(collection.designs.length, content.zlypni.designs)}</p>
      </header>
      <div ref={stageRef} className={styles.stage}>
        <HeroVisual designs={designs} switcher="compass" value={active} onChange={setActive} />
      </div>
      <p className={styles.hint}>{content.zlypni.hint}</p>
      <ul className={styles.grid}>
        {collection.designs.slice(0, shown).map((d) => (
          <li key={d.key}>
            <button
              type="button"
              className={styles.tile}
              aria-pressed={d.key === active}
              onClick={() => show(d.key)}>
              <span className={styles.poster}>
                <Image src={d.poster} alt="" fill sizes="(max-width: 768px) 50vw, 240px" />
              </span>
              <span className={styles.name}>{d.name}</span>
            </button>
          </li>
        ))}
      </ul>
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

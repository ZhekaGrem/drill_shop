// src/widgets/HeroLab/variants.tsx
// ТИМЧАСОВО: п'ять механік перемикання МІЖ колекціями. Живий 3D — лише в
// демо 1 (рекомендація): сайт мобільний, ліміт WebGL-контекстів ~8 на
// сторінку, і 4 герої вище вже їдять свої. Решта демо показують механіку на
// фолбек-фото; у продакшн-версії сцена в будь-якій механіці одна і жива.
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SegmentedControl } from '@mantine/core';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { HERO_COLLECTIONS, coverOf } from './collections';
import styles from './HeroLab.module.scss';

const Cover = ({ index, size = 240 }: { index: number; size?: number }) => (
  <Image
    className={styles.cover}
    src={coverOf(HERO_COLLECTIONS[index])}
    alt={HERO_COLLECTIONS[index].title}
    width={size}
    height={size}
  />
);

// 1 · Таби колекцій; під ними повноцінний живий герой (3D + перемикач дизайнів)
const TabsVariant = () => {
  const [key, setKey] = useState(HERO_COLLECTIONS[0].key);
  const col = HERO_COLLECTIONS.find((c) => c.key === key) ?? HERO_COLLECTIONS[0];
  return (
    <div className={styles.tabsBody}>
      <SegmentedControl
        fullWidth
        data={HERO_COLLECTIONS.map((c) => ({ label: c.title, value: c.key }))}
        value={key}
        onChange={setKey}
      />
      <div className={styles.copy}>
        <h3>{col.title}</h3>
        <p>{col.description}</p>
      </div>
      <HeroVisual key={col.key} designs={col.designs} switcher="thumbs" />
    </div>
  );
};

// 2 · Стрілки з лічильником (демо на фолбеках)
const ArrowsVariant = () => {
  const [i, setI] = useState(0);
  const n = HERO_COLLECTIONS.length;
  const step = (d: number) => setI((v) => (v + d + n) % n);
  const col = HERO_COLLECTIONS[i];
  return (
    <div className={styles.arrowsRow}>
      <button
        type="button"
        className={styles.arrowBtn}
        aria-label="Попередня колекція"
        onClick={() => step(-1)}>
        ←
      </button>
      <div className={styles.arrowsCenter}>
        <Cover index={i} />
        <div className={styles.copy}>
          <h4>{col.title}</h4>
          <p>{col.description}</p>
        </div>
        <span className={styles.counter}>
          {i + 1}/{n}
        </span>
      </div>
      <button
        type="button"
        className={styles.arrowBtn}
        aria-label="Наступна колекція"
        onClick={() => step(1)}>
        →
      </button>
    </div>
  );
};

// 3 · Peek-карусель: сусідні колекції визирають, свайп зі снапом
const PeekVariant = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const slide = el.firstElementChild as HTMLElement | null;
    if (!slide) return;
    setI(Math.round(el.scrollLeft / (slide.offsetWidth + 12)));
  };
  return (
    <div>
      <div className={styles.peek} ref={ref} onScroll={onScroll}>
        {HERO_COLLECTIONS.map((col, idx) => (
          <article key={col.key} className={styles.slide}>
            <Cover index={idx} size={200} />
            <div className={styles.copy}>
              <h4>{col.title}</h4>
            </div>
          </article>
        ))}
      </div>
      <span className={styles.counter}>активна: {HERO_COLLECTIONS[i]?.title ?? '—'} (свайпни вбік)</span>
    </div>
  );
};

// 4 · Обкладинки-плитки: ряд карт колекцій, активна розгорнута нижче
const CoversVariant = () => {
  const [i, setI] = useState(0);
  const col = HERO_COLLECTIONS[i];
  return (
    <div className={styles.tabsBody}>
      <div className={styles.covers}>
        {HERO_COLLECTIONS.map((c, idx) => (
          <button
            key={c.key}
            type="button"
            className={styles.coverCard}
            aria-pressed={i === idx}
            onClick={() => setI(idx)}>
            <Image src={coverOf(c)} alt="" width={84} height={84} />
            {c.title}
          </button>
        ))}
      </div>
      <div className={styles.autoBody}>
        <Cover index={i} />
        <div className={styles.copy}>
          <h4>{col.title}</h4>
          <p>{col.description}</p>
        </div>
      </div>
    </div>
  );
};

// 5 · Автогортання з прогрес-смужками (сторіз); клік по смужці — ручний вибір
const AutoplayVariant = () => {
  const [i, setI] = useState(0);
  const n = HERO_COLLECTIONS.length;
  useEffect(() => {
    const id = setTimeout(() => setI((v) => (v + 1) % n), 5000);
    return () => clearTimeout(id);
  }, [i, n]);
  return (
    <div className={styles.tabsBody}>
      <div className={styles.bars}>
        {HERO_COLLECTIONS.map((c, idx) => (
          <button
            key={c.key}
            type="button"
            className={styles.bar}
            aria-label={c.title}
            onClick={() => setI(idx)}>
            <span
              key={`${idx}-${i}`}
              className={styles.barFill}
              data-active={idx === i}
              data-done={idx < i}
            />
          </button>
        ))}
      </div>
      <div className={styles.autoBody}>
        <Cover index={i} />
        <div className={styles.copy}>
          <h4>{HERO_COLLECTIONS[i].title}</h4>
          <p>{HERO_COLLECTIONS[i].description}</p>
        </div>
      </div>
    </div>
  );
};

export const VARIANTS = [
  {
    title: '1 · Таби колекцій (живий герой)',
    hint: 'Pill-таби зверху, під ними той самий герой із 3D і перемикачем дизайнів. Рекомендація.',
    C: TabsVariant,
  },
  {
    title: '2 · Стрілки з лічильником',
    hint: 'Гортання колекцій по одній; компактно, звично. Демо на фолбек-фото.',
    C: ArrowsVariant,
  },
  {
    title: '3 · Peek-карусель',
    hint: 'Сусідні колекції визирають з країв, свайп зі снапом — мобільний патерн банерів.',
    C: PeekVariant,
  },
  {
    title: '4 · Обкладинки-плитки',
    hint: 'Ряд карт колекцій із мініатюрами; активна розгорнута нижче.',
    C: CoversVariant,
  },
  {
    title: '5 · Автогортання (сторіз)',
    hint: 'Колекції міняються самі що 5 с, прогрес-смужки зверху; клік — ручний вибір.',
    C: AutoplayVariant,
  },
];

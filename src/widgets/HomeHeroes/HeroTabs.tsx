// src/widgets/HomeHeroes/HeroTabs.tsx
// К3 Тактильний Мінімалізм: pill-таби колекцій + ОДИН герой активної.
// Жодного автогортання — темпом керує покупець. Сцена одна на всю головну;
// перемикання таба свопить набір дизайнів у тій самій сцені (власна модель
// колекції штатно перезавантажується всередині HeroVisual). Архівна
// колекція в табі отримує тиху мітку.
'use client';

import { useState } from 'react';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroBlock } from './HeroBlock';
import styles from './HomeHeroes.module.scss';

interface HeroTabsProps {
  collections: CollectionDef[];
  activeOf: (col: CollectionDef) => string;
  pick: (colKey: string) => (slug: string) => void;
}

export const HeroTabs = ({ collections, activeOf, pick }: HeroTabsProps) => {
  const [activeKey, setActiveKey] = useState(collections[0]?.key);
  const col = collections.find((c) => c.key === activeKey) ?? collections[0];
  if (!col) return null;

  return (
    <section className={styles.tabsHero}>
      <div className={styles.tabsRow} role="tablist" aria-label="Колекції">
        {collections.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={c.key === col.key}
            className={c.key === col.key ? styles.tabActive : styles.tab}
            onClick={() => setActiveKey(c.key)}>
            {c.title}
            {c.archivedAt && <span className={styles.tabArchived}>архів</span>}
          </button>
        ))}
      </div>
      <HeroBlock col={col} titleTag="h1" active={activeOf(col)} onPick={pick(col.key)} showAbout />
    </section>
  );
};

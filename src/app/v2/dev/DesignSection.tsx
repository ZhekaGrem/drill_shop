// src/app/v2/dev/DesignSection.tsx
// Перемикач дизайн-концепцій на дев-панелі: пише localStorage.design і
// атрибут data-design (палітри в globals.css, механіка героя в HomeHeroes).
// Після перемикання перераховує авто-тему за правилом нової концепції.
'use client';

import { DESIGN_OPTIONS, setDesignChoice, type DesignId } from '@/shared/config/design';
import { applyTheme, autoTheme, readThemeChoice } from '@/shared/config/theme';
import { useDesign } from '@/shared/hooks';
import styles from './dev.module.scss';

export const DesignSection = () => {
  const design = useDesign();

  const pick = (id: DesignId) => {
    setDesignChoice(id);
    if (readThemeChoice() === 'auto') applyTheme(autoTheme());
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Дизайн-концепція</h2>
      <div className={styles.designList} role="group" aria-label="Дизайн-концепція">
        {DESIGN_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={option.id === design ? styles.designRowActive : styles.designRow}
            aria-pressed={option.id === design}
            onClick={() => pick(option.id)}>
            <strong>{option.label}</strong>
            <span>{option.hint}</span>
          </button>
        ))}
      </div>
      <p className={styles.mono}>
        скіни позначок К2/К3 — CSS-демо без нових полів БД · механіку героя дивись на головній
      </p>
    </section>
  );
};

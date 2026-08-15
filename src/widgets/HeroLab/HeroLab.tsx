// src/widgets/HeroLab/HeroLab.tsx
// ТИМЧАСОВИЙ демо-блок №2: п'ять механік перемикання МІЖ колекціями
// (героями). Після вибору механіки видалити папку HeroLab і рядок у Home.tsx.
'use client';

import { Section } from '@/shared/components/Section/Section';
import { VARIANTS } from './variants';
import styles from './HeroLab.module.scss';

export const HeroLab = () => (
  <Section
    title="Перемикач героїв: варіанти (демо)"
    description="Тимчасовий блок: як гортати колекції в одному слоті героя. Живий 3D — у варіанті 1; решта на фолбеках (ліміт WebGL на телефоні), у проді сцена жива в будь-якій механіці">
    <div className={styles.lab}>
      {VARIANTS.map(({ title, hint, C }) => (
        <div key={title} className={styles.card}>
          <div>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardHint}>{hint}</div>
          </div>
          <C />
        </div>
      ))}
    </div>
  </Section>
);

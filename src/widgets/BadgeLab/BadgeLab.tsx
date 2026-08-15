// src/widgets/BadgeLab/BadgeLab.tsx
// ТИМЧАСОВО: лабораторія №3 — варіанти бейджа «Новинка» на макеті героя.
// Варіант 1 (градієнтна пігулка) — живий герой вище. Тут 2–5 на фолбеках.
// Після вибору видалити папку BadgeLab і рядок у Home.tsx.
'use client';

import Image from 'next/image';
import { Section } from '@/shared/components/Section/Section';
import { content } from '@/shared/config/content';
import styles from './BadgeLab.module.scss';

const FALLBACK = '/assets/img/tshirt-fallback.webp?v=2';

const Visual = ({ badge }: { badge?: React.ReactNode }) => (
  <div className={styles.visualWrap}>
    <Image className={styles.visual} src={FALLBACK} alt="" width={600} height={600} />
    {badge}
  </div>
);

const Copy = ({ before, titleExtra }: { before?: React.ReactNode; titleExtra?: React.ReactNode }) => (
  <div className={styles.copy}>
    {before}
    <div className={styles.titleRow}>
      <h3>{content.home.hero.title}</h3>
      {titleExtra}
    </div>
    <p>{content.home.hero.description}</p>
  </div>
);

const VARIANTS = [
  {
    title: '2 · Кутова плашка картки',
    hint: 'Чорна пігулка в правому верхньому куті героя — видно одразу, не чіпає композицію тексту.',
    C: () => (
      <div className={styles.heroBody}>
        <span className={styles.badgeCorner}>Новинка</span>
        <Copy />
        <Visual />
      </div>
    ),
  },
  {
    title: '3 · Стікер на візуалі',
    hint: 'Жовта наліпка з нахилом прямо на товарі — грайливо, у дусі мерчу.',
    C: () => (
      <div className={styles.heroBody}>
        <Copy />
        <Visual badge={<span className={styles.badgeSticker}>Новинка</span>} />
      </div>
    ),
  },
  {
    title: '4 · Інлайн біля заголовка',
    hint: 'Червона міні-пігулка в одному рядку з назвою — компактно, як маркер у каталогах.',
    C: () => (
      <div className={styles.heroBody}>
        <Copy titleExtra={<span className={styles.badgeInline}>Новинка</span>} />
        <Visual />
      </div>
    ),
  },
  {
    title: '5 · Пульсуюча крапка',
    hint: 'Мінімалізм: зелена крапка з пульсом і тихий підпис над заголовком.',
    C: () => (
      <div className={styles.heroBody}>
        <Copy
          before={
            <span className={styles.badgeDotRow}>
              <span className={styles.pulseDot} aria-hidden="true" />
              новинка
            </span>
          }
        />
        <Visual />
      </div>
    ),
  },
];

export const BadgeLab = () => (
  <Section
    title="Бейдж «Новинка»: варіанти (демо)"
    description="Тимчасовий блок. Варіант 1 — градієнтна пігулка — живе в героя вище; тут 2–5 на фолбек-фото (без нових WebGL-канвасів)">
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

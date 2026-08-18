'use client';
// Порівняльний стенд: той самий turntable у різних варіантах кодування
// поруч зі статичним постером (те, що в картках зараз). Кожен варіант —
// у макеті картки каталогу з реальною шириною сітки.
import Image from 'next/image';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import styles from './motion.module.scss';

interface Variant {
  src: string;
  title: string;
  meta: string;
}

// Розміри файлів — фактичні, з public/assets/img/motion (див. коміт пілота)
const VARIANTS: Variant[] = [
  { src: '/assets/img/motion/buba-poster-480.webp', title: 'Постер (як зараз)', meta: 'статичний · 15 КБ' },
  {
    src: '/assets/img/motion/buba-turn-480-12fps-q80.webp',
    title: '480px · 12 fps',
    meta: '24 кадри · 295 КБ',
  },
  {
    src: '/assets/img/motion/buba-turn-480-24fps-q80.webp',
    title: '480px · 24 fps',
    meta: '48 кадрів · 589 КБ',
  },
  {
    src: '/assets/img/motion/buba-turn-360-12fps-q75.webp',
    title: '360px · 12 fps',
    meta: '24 кадри · 191 КБ',
  },
  {
    src: '/assets/img/motion/buba-turn-720-12fps-q80.webp',
    title: '720px (retina) · 12 fps',
    meta: '24 кадри · 375 КБ',
  },
];

export const MotionPilot = () => (
  <Page>
    <PageHeader
      title="Motion-пілот каталогу"
      description="Turntable з Blender у animated WebP: порівняй плавність і вагу з постером. Сторінка існує лише в DEV_MODE."
    />

    <div className={styles.grid}>
      {VARIANTS.map((v) => (
        <figure key={v.src} className={styles.card}>
          <div className={styles.media}>
            {/* unoptimized: анімовані webp оптимізатор Next і так пропускає
                як є; прапорець прибирає зайвий проксі-крок */}
            <Image src={v.src} alt={`Худі «Культурний Фронт» — ${v.title}`} fill unoptimized />
          </div>
          <figcaption>
            <span className={styles.cardTitle}>{v.title}</span>
            <span className={styles.cardMeta}>{v.meta}</span>
          </figcaption>
        </figure>
      ))}
    </div>

    <p className={styles.note}>
      Продовий план: у сітці — постер (15 КБ), анімація підвантажується і вмикається лише коли картка у
      вʼюпорті; на prefers-reduced-motion лишається постер.
    </p>
  </Page>
);

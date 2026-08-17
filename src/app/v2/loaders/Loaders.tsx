// Пʼять концепцій завантажувального екрана. Кожна — самодостатній компонент,
// який заповнює свій контейнер (.stage). Розміри — у cqi, тож той самий код
// однаково виглядає в рамці прев'ю і на весь екран. Кольори тільки з токенів.
import type { ComponentType } from 'react';
import { SiteLoader } from '@/shared/components/SiteLoader/SiteLoader';
import styles from './loaders.module.scss';

// В1 · Логотип із переливом брендового градієнта + індетермінована смужка.
// Це САМ бойовий компонент app/loading.tsx — прев'ю не може розійтись з продом
const GradientLogo = () => <SiteLoader fill />;

// В2 · Фірмова пульсуюча крапка (та сама мова, що бейдж «класика»)
const PulseDot = () => (
  <div className={styles.center}>
    <span className={styles.bigDot} aria-hidden="true" />
    <span className={styles.caption}>одну хвильку…</span>
  </div>
);

// В3 · Скелет сторінки: сайт «малює сам себе», поки їде справжній контент
const PageSkeleton = () => (
  <div className={styles.skeleton} aria-hidden="true">
    <span className={`${styles.bone} ${styles.bonePill}`} />
    <span className={`${styles.bone} ${styles.boneHero}`} />
    <span className={styles.boneRow}>
      <span className={styles.bone} />
      <span className={styles.bone} />
      <span className={styles.bone} />
    </span>
  </div>
);

const TICKER = 'Є.ДРІЛ • ЩІЛЬНИЙ ДРІЛ • ОФІЦІЙНИЙ МЕРЧ • ';

// В4 · Стрітвір-тікер: дві стрічки в різні боки, контурний рядок між ними
const Ticker = () => (
  <div className={styles.tickerWrap}>
    <div className={styles.tickerRow} aria-hidden="true">
      <span>{TICKER.repeat(4)}</span>
      <span>{TICKER.repeat(4)}</span>
    </div>
    <div className={`${styles.tickerRow} ${styles.tickerRowBack}`} aria-hidden="true">
      <span>{TICKER.repeat(4)}</span>
      <span>{TICKER.repeat(4)}</span>
    </div>
    <span className={styles.caption}>вантажимось…</span>
  </div>
);

// В5 · Контур футболки малюється штрихом і йде по колу
const TeeDraw = () => (
  <div className={styles.center}>
    <svg className={styles.tee} viewBox="0 0 100 100" aria-hidden="true">
      <path
        className={styles.teePath}
        d="M30 18 L42 12 C45 20 55 20 58 12 L70 18 L82 34 L70 42 L70 84 L30 84 L30 42 L18 34 Z"
        pathLength={1}
      />
    </svg>
    <span className={styles.teeWordmark}>Є.ДРІЛ</span>
  </div>
);

export interface LoaderExample {
  id: string;
  title: string;
  hint: string;
  Comp: ComponentType;
}

export const LOADERS: LoaderExample[] = [
  {
    id: 'gradient-logo',
    title: 'Градієнтний логотип',
    hint: 'вже в проді (app/loading.tsx): перелив бренд-градієнта по лого, смужка-бігунок',
    Comp: GradientLogo,
  },
  {
    id: 'pulse-dot',
    title: 'Пульс',
    hint: 'мінімалізм: та сама крапка, що бейдж «класика» на колекціях',
    Comp: PulseDot,
  },
  {
    id: 'skeleton',
    title: 'Скелет сторінки',
    hint: 'каркас майбутньої сторінки з шимером — здається, що вже малюється',
    Comp: PageSkeleton,
  },
  {
    id: 'ticker',
    title: 'Тікер',
    hint: 'стрітвір-стрічки в різні боки; найгучніший варіант',
    Comp: Ticker,
  },
  {
    id: 'tee-draw',
    title: 'Футболка',
    hint: 'контур мерчу малюється штрихом по колу — про сам товар',
    Comp: TeeDraw,
  },
];

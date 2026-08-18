// src/shared/components/Logo/Logo.tsx
// Лого = сквіркл-марка «є.» (як app-іконка Дії і наш favicon) + словомарка
// «Дріл». Усе рендериться живим текстом (self-hosted e-UkraineHead) і CSS —
// без растру/SVG, щоб лишатись чітким на будь-якому масштабі (той самий
// підхід, що й у ворд-марки diia.gov.ua). Концепт-референси згенеровано
// через smm-factory (RunningHub Flux), фінал відтворено векторно.
import styles from './Logo.module.scss';

interface LogoProps {
  className?: string;
  /** 'md' — header (default), 'sm' — компактні місця типу footer */
  size?: 'md' | 'sm';
  /** Для темних поверхонь (напр. хедер/футер) — марка стає білою, текст світлим */
  inverse?: boolean;
  /** Словомарка після «є.» — дефолтний «Дріл»; приховані розділи підставляють
      свою (напр. «Олько» у «Мистецтві війни», див. config/hidden-collections) */
  wordmark?: string;
}

export function Logo({ className, size = 'md', inverse = false, wordmark = 'Дріл' }: LogoProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : '';
  const inverseClass = inverse ? styles.inverse : '';
  const classes = [styles.logo, sizeClass, inverseClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      <span className={styles.mark}>
        є<span className={styles.markDot}>.</span>
      </span>
      <span className={styles.word}>{wordmark}</span>
    </span>
  );
}

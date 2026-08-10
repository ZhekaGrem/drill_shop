// src/shared/components/Logo/Logo.tsx
// Текстова ворд-марка ye-dril — рендериться живим текстом (self-hosted e-UkraineHead),
// а не растровим/SVG зображенням, щоб лишатись чіткою на будь-якому масштабі
// (той самий підхід, що й у ворд-марки diia.gov.ua).
import styles from './Logo.module.scss';

interface LogoProps {
  className?: string;
  /** 'md' — header (default), 'sm' — компактні місця типу footer */
  size?: 'md' | 'sm';
  /** Для темних поверхонь (напр. футер) — світлий текст замість --text-primary */
  inverse?: boolean;
}

export function Logo({ className, size = 'md', inverse = false }: LogoProps) {
  const sizeClass = size === 'sm' ? styles.sizeSm : '';
  const inverseClass = inverse ? styles.inverse : '';
  const classes = [styles.logo, sizeClass, inverseClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      Є<span className={styles.dot}>.</span>Дріл
    </span>
  );
}

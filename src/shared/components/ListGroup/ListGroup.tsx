// src/shared/components/ListGroup/ListGroup.tsx
// Група-картка Дії: ОДНА біла поверхня, всередині — рядки, між ними тонкий
// роздільник з відступом від країв. Раніше однотипні пункти в нас були сіткою
// окремих карток з межею й тінню — це мова generic e-commerce, не Дії
// (Gestalt Common Region: спільна область = група).
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AppLink } from '@/shared/components/AppLink';
import { ArrowCircle } from '@/shared/components/ArrowCircle/ArrowCircle';
import styles from './ListGroup.module.scss';

interface ListGroupProps {
  children: ReactNode;
  className?: string;
}

export const ListGroup = ({ children, className }: ListGroupProps) => (
  <div className={clsx(styles.group, className)}>{children}</div>
);

interface ListRowProps {
  title: ReactNode;
  /** Тихий рядок під заголовком: пояснення, метадані, статус */
  hint?: ReactNode;
  /** Значення праворуч (характеристика, ціна, кількість) — замість стрілки */
  value?: ReactNode;
  /** Іконка або ілюстрація зліва */
  media?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Зовнішнє посилання — відкривається в новій вкладці */
  external?: boolean;
  /** Коло-стрілка справа. За замовчуванням є в усіх клікабельних рядках */
  arrow?: boolean;
  className?: string;
}

export const ListRow = ({
  title,
  hint,
  value,
  media,
  href,
  onClick,
  external,
  arrow,
  className,
}: ListRowProps) => {
  const isInteractive = Boolean(href || onClick);
  const showArrow = arrow ?? (isInteractive && !value);

  const body = (
    <>
      {media && <span className={styles.media}>{media}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      {value && <span className={styles.value}>{value}</span>}
      {showArrow && <ArrowCircle size="sm" className={styles.arrow} />}
    </>
  );

  const rowClass = clsx(styles.row, isInteractive && styles.rowInteractive, className);

  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {body}
      </a>
    ) : (
      <AppLink href={href} className={rowClass}>
        {body}
      </AppLink>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {body}
      </button>
    );
  }

  return <div className={rowClass}>{body}</div>;
};

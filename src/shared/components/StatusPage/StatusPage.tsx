// src/shared/components/StatusPage/StatusPage.tsx
// Одна форма для всіх «результатних» екранів: 404, помилка, підтвердження
// пошти, успішна/невдала оплата, створене замовлення. До цього кожен з них
// був окремою версткою з власними відступами, розмірами й центруванням —
// і виглядали вони як сторінки різних сайтів.
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Page } from '@/shared/components/Page/Page';
import styles from './StatusPage.module.scss';

interface StatusPageProps {
  /** Іконка або ілюстрація над заголовком */
  icon?: ReactNode;
  /** Дрібний рядок над заголовком: код помилки, номер замовлення */
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Додатковий вміст під описом (деталі замовлення, форма) */
  children?: ReactNode;
  /** Кнопки внизу картки */
  actions?: ReactNode;
  /** Фарбує лише іконку — текст лишається читабельно-чорним */
  tone?: 'neutral' | 'success' | 'error';
  className?: string;
}

export const StatusPage = ({
  icon,
  eyebrow,
  title,
  description,
  children,
  actions,
  tone = 'neutral',
  className,
}: StatusPageProps) => (
  <Page width="narrow" className={styles.page}>
    <div className={clsx(styles.card, className)}>
      {icon && <span className={clsx(styles.icon, styles[`icon--${tone}`])}>{icon}</span>}
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.body}>{children}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  </Page>
);

// src/shared/components/PageHeader/PageHeader.tsx
// Заголовок сторінки в мові Дії: великий H1 зліва, під ним тихий підзаголовок.
// Кожна сторінка раніше малювала цю пару по-своєму — свій розмір, своя вага,
// свій відступ до контенту. Тепер одна форма на весь сайт.
import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
  title: ReactNode;
  /** Тихий рядок під заголовком — пояснює, що це за сторінка */
  description?: ReactNode;
  /** Дія праворуч від заголовка (кнопка «Назад», лічильник тощо) */
  aside?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, aside, className }: PageHeaderProps) => (
  <header className={clsx(styles.header, className)}>
    <div className={styles.text}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>
    {aside && <div className={styles.aside}>{aside}</div>}
  </header>
);

// src/shared/components/Page/Page.tsx
// Єдиний контейнер сторінки: одна максимальна ширина, одні горизонтальні поля.
// До цього кожна сторінка оголошувала власний `.container` без max-width, тож на
// широкому екрані контент розтягувався на всю ширину — мова Дії (одна колонка) ламалась.
import type { ElementType, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Page.module.scss';

interface PageProps {
  children: ReactNode;
  className?: string;
  /** narrow — читабельна колонка для тексту (юридичні сторінки, форми) */
  width?: 'default' | 'narrow' | 'wide';
  as?: ElementType;
}

export const Page = ({ children, className, width = 'default', as: Tag = 'div' }: PageProps) => (
  <Tag className={clsx(styles.page, styles[`page--${width}`], className)}>{children}</Tag>
);

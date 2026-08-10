// src/shared/components/Page/Page.tsx
// Єдиний контейнер сторінки: одна максимальна ширина, одні горизонтальні поля.
// До цього кожна сторінка оголошувала власний `.container` без max-width, тож на
// широкому екрані контент розтягувався на всю ширину — мова Дії (одна колонка) ламалась.
import type { ElementType, ReactNode } from 'react';
import { ViewTransition } from 'react';
import clsx from 'clsx';
import styles from './Page.module.scss';

// Напрямок переходу приходить від <AppLink> через transitionTypes.
// default: 'none' обовʼязковий — без нього сторінка анімувалась би на будь-якому
// незвʼязаному переході, зокрема на розкритті Suspense і на router.refresh().
const NAV_ANIMATIONS = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'none',
} as const;

interface PageProps {
  children: ReactNode;
  className?: string;
  /** narrow — читабельна колонка для тексту (юридичні сторінки, форми) */
  width?: 'default' | 'narrow';
  as?: ElementType;
}

export const Page = ({ children, className, width = 'default', as: Tag = 'div' }: PageProps) => (
  // <ViewTransition> живе тут, а не в layout.tsx: лейаути переживають навігацію,
  // тому enter/exit у них ніколи не спрацьовують. <Page> рендериться з page.tsx
  // і розмонтовується при переході — саме те, що потрібно.
  <ViewTransition enter={NAV_ANIMATIONS} exit={NAV_ANIMATIONS} default="none">
    <Tag className={clsx(styles.page, styles[`page--${width}`], className)}>{children}</Tag>
  </ViewTransition>
);

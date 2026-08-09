// src/shared/components/Breadcrumbs/Breadcrumbs.tsx
//
// Хлібні крихти жили тільки на сторінці товару — вкладеною розміткою всередині
// productDetails.module.scss. Каталог, який на крок вище в тій самій ієрархії,
// їх не мав узагалі: людина не бачила «де я» рівно там, де це найпотрібніше
// (Nielsen #1, видимість статусу системи).
//
// Один компонент на весь сайт, щоб «Головна › Каталог › Товар» скрізь виглядав
// і поводився однаково (Nielsen #4, консистентність).
import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.scss';

export interface Crumb {
  label: string;
  /** Останній рівень — без href: це поточна сторінка, а не посилання */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (items.length === 0) return null;

  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label="Навігаційний ланцюжок">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

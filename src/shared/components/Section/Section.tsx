// src/shared/components/Section/Section.tsx
// Секція сторінки: один вертикальний ритм + заголовок з опційною вторинною дією.
// У Дії заголовок секції завжди зліва, дрібніший за H1, і між ним та вмістом —
// один і той самий відступ на всіх екранах.
import type { ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './Section.module.scss';

interface SectionProps {
  title?: string;
  /** Тихий рядок під заголовком — пояснює, що в секції, коли назви замало */
  description?: string;
  /** Вторинна дія праворуч від заголовка («Дивитись усі») */
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  /** Заголовок секції як H2 за замовчуванням; H3 — для вкладених секцій */
  headingLevel?: 'h2' | 'h3';
}

export const Section = ({
  title,
  description,
  action,
  children,
  className,
  headingLevel: Heading = 'h2',
}: SectionProps) => (
  <section className={clsx(styles.section, className)}>
    {(title || action) && (
      <div className={styles.head}>
        <div className={styles.headText}>
          {title && <Heading className={styles.title}>{title}</Heading>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action && (
          <Link href={action.href} className={styles.action}>
            {action.label}
          </Link>
        )}
      </div>
    )}
    {children}
  </section>
);

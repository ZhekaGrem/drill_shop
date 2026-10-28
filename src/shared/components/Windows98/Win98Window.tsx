// src/shared/components/Windows98/Win98Window.tsx
// Вікно Windows 98 для блоку сторінки (головна: «Категорії», «Часті питання», «Звʼязок»). Рендериться лише в дизайні
// Windows 98 — дизайни до нього показують ті самі блоки звичайною <Section> (docs/windows-95-98-encyclopedia.md §16).
// Синя смуга — заголовок блоку (h2) з кнопкою-посиланням праворуч; вміст — на білому втиснутому полі
// ([data-win98-field]: ListGroup стає списком, стрілки — піднятими кнопками); знизу — рядок стану, якщо потрібен.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Windows98WindowBar } from './Windows98';
import styles from './win98-window.module.scss';

interface Win98WindowProps {
  title: string;
  /** Кнопка в смузі заголовка («Усі товари», «Усі питання») */
  action?: { href: string; label: string };
  /** Рядок стану під полем, як у Провіднику («Об'єктів: 4») */
  status?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Рівень заголовка в смузі: h2 для блоку сторінки, h1 — коли вікно і є сторінкою (кошик) */
  as?: 'h1' | 'h2';
  /** Значок у смузі замість теки (Win98Icon) */
  icon?: ReactNode;
}

export function Win98Window({
  title,
  action,
  status,
  children,
  className,
  as = 'h2',
  icon,
}: Win98WindowProps) {
  return (
    <section className={`${styles.window} ${className ?? ''}`} data-store-window="">
      <Windows98WindowBar
        as={as}
        icon={icon}
        title={title}
        action={
          action && (
            <Link href={action.href} data-win98-bar-button="">
              {action.label}
            </Link>
          )
        }
      />
      <div className={styles.field} data-win98-field="">
        {children}
      </div>
      {status && <p className={styles.status}>{status}</p>}
    </section>
  );
}

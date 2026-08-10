// src/widgets/BottomNav/BottomNav.tsx
// Спільна основа нижньої панелі — таб-бар у мові Дії.
//
// Один компонент на два контексти: сайт (SiteBottomNav) і Telegram Mini App
// (TelegramBottomNav). Раніше панель існувала тільки для Telegram і несла в собі
// і геометрію, і safe-area, і набір табів одночасно — другий такий самий низ для
// вебу означав би дві панелі, які розійдуться з першим же правком.
// Тут лишається тільки те, що спільне: розкладка, стани, бейдж, safe-area.
// Що саме показувати — вирішує обгортка.
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './BottomNav.module.scss';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Лічильник над іконкою (кошик). 0 і undefined однаково не малюються */
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  /** Побічна дія перед переходом — напр. haptic feedback у Telegram */
  onNavigate?: (href: string) => void;
  ariaLabel?: string;
  className?: string;
  /**
   * На яких ширинах панель реально видно. Керує нижнім падінгом сторінки в
   * globals.css: веб-панель ховається від 1024px, тож і падінг там зайвий,
   * а Telegram-панель видно завжди.
   */
  scope?: 'mobile' | 'always';
}

/** '/' активний тільки точним збігом, інакше він світився б на кожній сторінці */
const isItemActive = (href: string, pathname: string) => {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
};

export function BottomNav({
  items,
  onNavigate,
  ariaLabel = 'Основна навігація',
  className,
  scope = 'always',
}: BottomNavProps) {
  const pathname = usePathname() ?? '';

  // Панель лежить поверх контенту, тож нижній край сторінки треба звільнити —
  // інакше вона накриває футер і останню кнопку на екрані.
  // Атрибут на <body>, а не inline-стиль: величина живе в CSS поруч із висотою
  // самої панелі, і дві обгортки не затирають стиль одна одній.
  useEffect(() => {
    document.body.dataset.bottomNav = scope;
    return () => {
      delete document.body.dataset.bottomNav;
    };
  }, [scope]);

  const activeIndex = items.findIndex((item) => isItemActive(item.href, pathname));

  return (
    <nav className={clsx(styles.bar, className)} aria-label={ariaLabel}>
      {/* Активна підкладка — ОДНА пігулка, що переїжджає між табами, а не
          чотири, які згасають/загоряються (одне «тіло» читається як той самий
          обʼєкт на новому місці, перефарбовування — як блимання).
          Поки жоден таб не активний, пігулки немає — інакше вона приїжджала б
          із нульової позиції при першому переході. */}
      <div
        className={styles.inner}
        data-has-active={activeIndex >= 0 || undefined}
        style={
          { '--active-index': Math.max(activeIndex, 0), '--nav-count': items.length } as React.CSSProperties
        }>
        <span className={styles.pill} aria-hidden="true" />
        <ul className={styles.list}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href, pathname);
            const badge = item.badge && item.badge > 0 ? item.badge : null;

            return (
              <li key={item.href} className={styles.item}>
                <Link
                  href={item.href}
                  onClick={() => onNavigate?.(item.href)}
                  className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                  aria-current={active ? 'page' : undefined}>
                  <span className={styles.iconWrap}>
                    <Icon size={24} />
                    {badge && (
                      <span className={styles.badge} aria-hidden="true">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </span>
                  <span className={styles.label}>{item.label}</span>
                  {badge && <span className="sr-only">{`, у кошику: ${badge}`}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconFolder, IconHome, IconShoppingBag, IconMenu2 } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface WindowBarProps {
  title?: ReactNode;
  action?: ReactNode;
  /**
   * Тег назви. span — смуга лише повторює заголовок вікна. h1/h2 — смуга сама є заголовком: так роблять лише
   * гілки, що рендеряться тільки в дизайні Windows 98, бо поза ним смуги не видно.
   */
  as?: 'span' | 'h1' | 'h2' | 'h3';
  /** Власний вміст замість назви (хлібні крихти сторінки товару) */
  children?: ReactNode;
}

/** Always present in HTML; the theme controls visibility before the first paint. */
export function Windows98WindowBar({ title, action, as: Title = 'span', children }: WindowBarProps) {
  return (
    <div className="win98-window-bar">
      <IconFolder size={18} aria-hidden="true" />
      {children ?? <Title>{title}</Title>}
      {action}
    </div>
  );
}

export function Windows98Taskbar() {
  const pathname = usePathname();
  const tasks = [
    { href: '/', label: 'єДріл', icon: IconHome, active: pathname === '/' },
    {
      href: '/catalog',
      label: 'Каталог',
      icon: IconFolder,
      active: pathname.startsWith('/catalog') || pathname.startsWith('/v2/a/'),
    },
    {
      href: '/cart',
      label: 'Кошик',
      icon: IconShoppingBag,
      active: pathname === '/cart' || pathname === '/checkout',
    },
  ];
  return (
    <nav className="win98-taskbar" aria-label="Панель завдань">
      <Link href="/menu" className="win98-start" aria-current={pathname === '/menu' ? 'page' : undefined}>
        <IconMenu2 size={20} aria-hidden="true" />
        <strong>Пуск</strong>
      </Link>
      <div className="win98-tasks">
        {tasks.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <span className="win98-tray" aria-label="Магазин єДріл">
        єДріл / 98
      </span>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconFolder, IconHome, IconShoppingBag, IconMenu2 } from '@tabler/icons-react';
import type { ReactNode } from 'react';

/** Always present in HTML; the theme controls visibility before the first paint. */
export function Windows98WindowBar({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="win98-window-bar">
      <IconFolder size={18} aria-hidden="true" />
      <span>{title}</span>
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

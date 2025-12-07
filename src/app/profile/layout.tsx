'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth';
import Link from 'next/link';
import styles from './profile.module.scss';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const navigation = [
    {
      label: 'Профіль',
      href: '/profile',
      active: pathname === '/profile',
    },
    {
      label: 'Обрані товари',
      href: '/profile/favorites',
      active: pathname === '/profile/favorites',
    },
    {
      label: 'Мої замовлення',
      href: '/profile/orders',
      active: pathname === '/profile/orders',
    },
  ];

  useEffect(() => {
    if (!isInitialized) return;
    if (hasRedirected.current) return;
    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <nav>
            <ul className={styles.navList}>
              {navigation.map((item) => {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${item.active ? styles.navItem__active : ''}`}>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

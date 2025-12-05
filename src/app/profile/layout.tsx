'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth';
import { IconUser, IconHeart, IconShoppingCart } from '@tabler/icons-react';
import Link from 'next/link';
import styles from './profile.module.scss';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const navigation = [
    {
      label: 'Особисті дані',
      href: '/profile',
      icon: IconUser,
      active: pathname === '/profile',
    },
    {
      label: 'Обрані товари',
      href: '/profile/favorites',
      icon: IconHeart,
      active: pathname === '/profile/favorites',
    },
    {
      label: 'Мої замовлення',
      href: '/profile/orders',
      icon: IconShoppingCart,
      active: pathname === '/profile/orders',
    },
  ];

  useEffect(() => {
    if (!isInitialized) return;
    if (hasRedirected.current) return;
    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace(`/login?from=${pathname}`);
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
                const IconComponent = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${item.active ? styles.navItem__active : ''}`}>
                      <IconComponent size={20} />
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

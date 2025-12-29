'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Badge, Box } from '@mantine/core';
import { IconShoppingBag, IconShoppingCart, IconUser, IconBong } from '@tabler/icons-react';
import { useTelegram } from '@/shared/providers/TelegramProvider';
import { useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { triggerHapticFeedback } from '@/shared/utils/telegram';
import styles from './TelegramBottomNav.module.scss';

interface NavItem {
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  label: string;
  href: string;
  badge?: number;
}

export function TelegramBottomNav() {
  const { isTelegramEnv } = useTelegram();
  const pathname = usePathname();
  const router = useRouter();
  const calculations = useCartCalculations();
  const syncCart = useCartStore((state) => state.syncCart);

  // Синхронізація корзини при mount (тільки для Telegram)
  useEffect(() => {
    if (isTelegramEnv) {
      console.log('🛒 TelegramBottomNav: Initializing cart...');
      syncCart();
    }
  }, [isTelegramEnv, syncCart]);

  // Додати padding до main елемента для bottom nav
  useEffect(() => {
    if (isTelegramEnv) {
      document.body.style.paddingBottom = 'calc(70px + env(safe-area-inset-bottom, 0px))';
      return () => {
        document.body.style.paddingBottom = '';
      };
    }
  }, [isTelegramEnv]);

  // Не показувати навігацію якщо не в Telegram
  if (!isTelegramEnv) {
    return null;
  }

  // Не показувати на admin сторінках
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      icon: IconBong,
      label: 'Про нас',
      href: '/telegram/about',
    },
    {
      icon: IconShoppingBag,
      label: 'Каталог',
      href: '/telegram/catalog',
    },
    {
      icon: IconShoppingCart,
      label: 'Кошик',
      href: '/telegram/cart',
      badge: calculations?.itemsCount || 0,
    },

    {
      icon: IconUser,
      label: 'Профіль',
      href: '/telegram/profile',
    },
  ];

  const handleNavClick = async (href: string) => {
    // Haptic feedback при кліку
    await triggerHapticFeedback('impact', 'light');
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/telegram') {
      return pathname === '/telegram';
    }
    return pathname?.startsWith(href);
  };

  return (
    <Box className={styles.bottomNav}>
      <div className={styles.topLine} />
      <nav className={styles.navContainer}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              onClick={() => handleNavClick(item.href)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}>
              <div className={styles.iconWrapper}>
                <Icon size={24} stroke={1.5} />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge size="xs" circle className={styles.badge}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </Box>
  );
}

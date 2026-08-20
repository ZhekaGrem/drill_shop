// src/widgets/Header/Header.tsx
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, Badge } from '@mantine/core';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { CartDrawer } from '@/features/cart/components/CartDrawer/CartDrawer';
import { Logo } from '@/shared/components/Logo';
import { useHiddenWordmarks } from '@/shared/hooks/useTurntables';
import { IconCart, IconCatalog, MenuIcon } from '@/shared/components/Svg';

// Десктопна навігація текстом. На мобільному ті самі розділи відкриваються
// кнопками-іконками праворуч (каталог) і екраном «Меню».
const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

/** Порівнюємо ТІЛЬКИ pathname, свідомо: щоб врахувати query, потрібен
 *  `useSearchParams()`, а він у Next вимагає Suspense і вибиває сторінку зі
 *  статичної генерації. Проєкт тримається на SSG/ISR — підкреслений пункт
 *  того не вартий. Наразі жоден пункт навігації query й не має. */
const isNavItemActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  // Прихований розділ підмінює словомарку логотипа (є. Дріл → є. Олько):
  // слаг товару зі шляху сторінки товару шукаємо серед товарів прихованих
  // колекцій (мапа з /collections, спільний кеш ['collections-raw'])
  const { data: hiddenWordmarks } = useHiddenWordmarks();
  const productSlug = pathname.match(/^\/(?:v2\/a|catalog)\/([^/]+)$/)?.[1];
  const wordmark = (productSlug && hiddenWordmarks?.[decodeURIComponent(productSlug)]) || undefined;
  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  return (
    <Box className={styles.wrapper}>
      <header className={styles.header}>
        {/* Left group: Logo + Nav */}
        <div className={styles.headerLeft}>
          {/* Logo (Left) */}
          {/* inverse — хедер тепер чорний, як верхня панель Дії. Без цього
              ворд-марка малюється --text-primary, тобто чорним по чорному. */}
          <Link href="/" className={styles.logoLink} aria-label="ye-dril — на головну">
            <Logo inverse className={styles.headerLogo} wordmark={wordmark} />
          </Link>

          {/* Desktop navigation */}
          <nav className={styles.desktopNav} aria-label="Основна навігація">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Права група (рішення власника): каталог, меню, кошик — самі іконки.
            Пошук прибраний із хедера, нижня панель навігації видалена, тож ці
            дві кнопки лишились єдиним входом у каталог і меню з будь-якої
            сторінки. */}
        <div className={styles.headerRight}>
          <Link href="/catalog" className={styles.iconButton} aria-label="Каталог">
            <IconCatalog />
          </Link>

          <Link href="/menu" className={styles.iconButton} aria-label="Меню">
            <MenuIcon />
          </Link>

          <button className={styles.cartButton} onClick={toggleCartDrawer} aria-label="Кошик">
            <IconCart />
            {calculations && calculations.itemsCount > 0 && (
              /* key змушує React перемонтувати бейдж на кожній зміні числа —
                 pop-анімація програється знову, і додавання товару видно боковим
                 зором навіть коли кошик далеко від кнопки «додати» */
              <Badge size="sm" circle className={styles.cartIconBadge} key={calculations.itemsCount}>
                {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
              </Badge>
            )}
          </button>
          {/* Кнопка «Кабінет» прибрана з навбару (рішення власника) —
              профіль/адмінка доступні прямими URL */}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </Box>
  );
}

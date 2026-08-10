// src/widgets/Header/Header.tsx
'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { Box, Menu, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { CartDrawer } from '@/features/cart/components/CartDrawer/CartDrawer';
import { AuthDrawer } from '@/features/auth/components/AuthDrawer/AuthDrawer';
import { content } from '@/shared/config/content';
import { Logo } from '@/shared/components/Logo';
import { IconX, IconSearch, IconCart, IconUser } from '@/shared/components/Svg';

// Тільки десктопна навігація. На мобільному ці розділи живуть у таб-барі
// (widgets/BottomNav) і на екрані «Кабінет» — бургер-шторки більше немає.
const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

// SINGLE logout handler
const useLogoutHandler = () => {
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    await logout();
    window.location.href = '/';
  };
};

// ✅ Оптимізовано: React.memo
const AuthControl = React.memo(
  ({
    onNavigate,
    onOpenAuth,
    onCloseAuth,
    isAuthDrawerOpen,
  }: {
    onNavigate?: () => void;
    onOpenAuth: () => void;
    onCloseAuth: () => void;
    isAuthDrawerOpen: boolean;
  }) => {
    const userProfile = useAuthStore((state) => state.userProfile);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const handleLogout = useLogoutHandler();
    const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
    const isManager = userProfile?.role === 'MANAGER' || isAdmin;

    const handleLogoutClick = async () => {
      onNavigate?.();
      await handleLogout();
    };

    if (!isInitialized) {
      // Той самий розмір, що й справжня пігулка — інакше хедер стрибає,
      // коли auth ініціалізується і кнопка «Кабінет» з'являється
      return (
        <button className={styles.accountPill} disabled aria-hidden="true" tabIndex={-1}>
          <IconUser />
          <span>Кабінет</span>
        </button>
      );
    }

    if (isAuthenticated && userProfile) {
      return (
        <Menu
          shadow="md"
          width={200}
          classNames={{
            dropdown: styles.dropdown,
            item: styles.menuItem,
            label: styles.menuLabel,
            divider: styles.menuDivider,
          }}>
          <Menu.Target>
            <button className={styles.accountPill} aria-label="Кабінет">
              <IconUser />
              <span>Кабінет</span>
            </button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{content.header.accountMenu.label}</Menu.Label>
            <Menu.Item component={Link} href="/profile">
              {content.header.accountMenu.profile}
            </Menu.Item>
            {/* <Menu.Item component={Link} href="/profile/favorites">
              {content.header.accountMenu.favorites}
            </Menu.Item> */}
            <Menu.Item component={Link} href="/profile/orders">
              {content.header.accountMenu.orders}
            </Menu.Item>
            {isManager && (
              <>
                <Menu.Divider />
                <Menu.Label>{content.header.accountMenu.management}</Menu.Label>
                <Menu.Item component={Link} href="/admin" leftSection={<IconSettings size={18} />}>
                  {content.header.accountMenu.adminPanel}
                </Menu.Item>
              </>
            )}
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={18} />} onClick={handleLogoutClick}>
              {content.header.accountMenu.logout}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      );
    }
    const handleAuthToggle = () => {
      if (isAuthDrawerOpen) {
        onCloseAuth();
      } else {
        onOpenAuth();
      }
    };
    return (
      <button className={styles.accountPill} onClick={handleAuthToggle} aria-label="Кабінет">
        {isAuthDrawerOpen ? <IconX /> : <IconUser />}
        <span>Кабінет</span>
      </button>
    );
  }
);

/** Порівнюємо ТІЛЬКИ pathname, свідомо: щоб врахувати query, потрібен
 *  `useSearchParams()`, а він у Next вимагає Suspense і вибиває сторінку зі
 *  статичної генерації. Проєкт тримається на SSG/ISR — підкреслений пункт
 *  того не вартий. Наразі жоден пункт навігації query й не має. */
const isNavItemActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const RECENT_KEY = 'recent-searches';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authDrawerOpened, { open: openAuthDrawer, close: closeAuthDrawer }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const saveRecent = (q: string) => {
    const next = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // router.push, а не window.location.href: останнє перезавантажує весь
  // документ (заново шрифти, JS, стан кошика) там, де достатньо клієнтського
  // переходу. Пошук — найчастіша дія в магазині, і саме вона була найповільнішою
  // (4.7 Doherty: відгук має вкладатись у ~400 мс).
  const goToSearch = (query: string) => {
    saveRecent(query);
    router.push(`/catalog?search=${encodeURIComponent(query)}`);
    setIsSearchExpanded(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) goToSearch(query);
  };

  const handleSearchFocus = () => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {
      setRecentSearches([]);
    }
    setIsSearchExpanded(true);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  const handleAuthSuccess = () => {
    closeAuthDrawer();
    window.location.reload();
  };

  return (
    <Box className={styles.wrapper}>
      <header className={styles.header}>
        {/* Left group: Logo + Nav */}
        <div className={styles.headerLeft}>
          {/* Logo (Left) */}
          {/* inverse — хедер тепер чорний, як верхня панель Дії. Без цього
              ворд-марка малюється --text-primary, тобто чорним по чорному. */}
          <Link href="/" className={styles.logoLink} aria-label="ye-dril — на головну">
            <Logo inverse className={styles.headerLogo} />
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

        {/* Right group: Search + Cart + Account */}
        <div className={styles.headerRight}>
          {/* Search pill (desktop) */}
          <button
            type="button"
            className={styles.searchPill}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <span className={styles.searchPillText}>Пошук</span>
            <IconSearch className={styles.searchPillIcon} />
          </button>

          {/* Search icon (mobile) */}
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <IconSearch className={styles.searchPlaceholder} />
          </button>

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
          <AuthControl
            onOpenAuth={openAuthDrawer}
            onCloseAuth={closeAuthDrawer}
            isAuthDrawerOpen={authDrawerOpened}
          />
        </div>
      </header>

      {/* Expanded Search Bar */}
      {isSearchExpanded && (
        <div className={styles.expandedSearchContainer}>
          <form onSubmit={handleSearch} className={styles.expandedSearchForm}>
            <input
              type="text"
              className={styles.expandedSearchInput}
              placeholder="Пошук товарів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim()) {
                  setIsSearchExpanded(false);
                }
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.expandedSearchClear}
                onClick={handleSearchClear}
                aria-label="Очистити">
                <IconX />
              </button>
            )}
          </form>
          {recentSearches.length > 0 && !searchQuery && (
            <div className={styles.searchSuggestions}>
              <span className={styles.suggestionsLabel}>Останні запити</span>
              {recentSearches.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.suggestionItem}
                  onMouseDown={() => goToSearch(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Drawer */}
      <AuthDrawer opened={authDrawerOpened} onClose={closeAuthDrawer} onSuccess={handleAuthSuccess} />
    </Box>
  );
}

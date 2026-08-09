// src/widgets/Header/Header.tsx
'use client';
import React, { useState } from 'react';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { Box, Drawer, Menu, ScrollArea, Badge } from '@mantine/core';
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
import { IconX, MenuIcon, IconSearch, IconCart, IconUser } from '@/shared/components/Svg';

const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Розпродаж', href: '/catalog?promo=true' },
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

// ✅ Mobile menu з іконками та chevron
const MobileMenu = React.memo(
  ({ opened, onClose, onNavigate }: { opened: boolean; onClose: () => void; onNavigate: () => void }) => {
    return (
      <Drawer
        closeButtonProps={{
          icon: <IconX />,
        }}
        opened={opened}
        onClose={onClose}
        position="left"
        size="480px"
        className={styles.drawer}>
        <ScrollArea h="calc(100vh - 80px)">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.menuLink} onClick={onNavigate}>
              <div className={styles.menuIcon}>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </ScrollArea>
      </Drawer>
    );
  }
);

const RECENT_KEY = 'recent-searches';

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecent(searchQuery.trim());
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchExpanded(false);
    }
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
        {/* Left group: Burger (mobile) + Logo + Nav */}
        <div className={styles.headerLeft}>
          <button
            className={styles.burgerButton}
            onClick={toggleDrawer}
            aria-label={drawerOpened ? 'Закрити меню' : 'Відкрити меню'}>
            {drawerOpened ? <IconX /> : <MenuIcon />}
          </button>

          {/* Logo (Left) */}
          <Link href="/" className={styles.logoLink} aria-label="ye-dril — на головну">
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <nav className={styles.desktopNav} aria-label="Основна навігація">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
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
              <Badge size="sm" circle color="red" className={styles.cartIconBadge}>
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
                  onMouseDown={() => {
                    saveRecent(q);
                    window.location.href = `/catalog?search=${encodeURIComponent(q)}`;
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <MobileMenu opened={drawerOpened} onClose={closeDrawer} onNavigate={closeDrawer} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Drawer */}
      <AuthDrawer opened={authDrawerOpened} onClose={closeAuthDrawer} onSuccess={handleAuthSuccess} />
    </Box>
  );
}

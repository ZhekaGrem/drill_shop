// src/widgets/Header/Header.tsx
'use client';
import React, { useState } from 'react';
import { IconLogout, IconSettings, IconHeart } from '@tabler/icons-react';
import { Box, Drawer, Menu, ScrollArea, Stack, Divider, Text, Group, Badge, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { CartDrawer } from '@/features/cart/components/CartDrawer/CartDrawer';
import { AuthDrawer } from '@/features/auth/components/AuthDrawer/AuthDrawer';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import { IconX, MenuIcon, IconSearch, IconCart, IconUser } from '@/shared/components/Svg';
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
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
    const isManager = userProfile?.role === 'MANAGER' || isAdmin;

    const handleLogoutClick = async () => {
      onNavigate?.();
      await handleLogout();
    };

    if (!isInitialized) {
      return null;
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
            <button className={styles.iconButton}>{userMenuOpened ? <IconX /> : <IconUser />}</button>
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
      <button className={styles.iconButton} onClick={handleAuthToggle}>
        {isAuthDrawerOpen ? <IconX /> : <IconUser />}
      </button>
    );
  }
);

// ✅ Mobile menu з іконками та chevron
const MobileMenu = React.memo(
  ({ opened, onClose, onNavigate }: { opened: boolean; onClose: () => void; onNavigate: () => void }) => {
    const userProfile = useAuthStore((state) => state.userProfile);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const handleLogout = useLogoutHandler();

    const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
    const isManager = userProfile?.role === 'MANAGER' || isAdmin;

    const handleLogoutClick = async () => {
      onNavigate();
      await handleLogout();
    };

    const menuItems = [
      { label: 'КАТАЛОГ', href: '/catalog' },
      { label: 'КОНТАКТИ', href: '/contact' },
      { label: 'ПРО НАС', href: '/about' },
      { label: 'Розпродаж', href: '/catalog?promo=true' },
      // { label: 'Футболки', href: '/catalog?category=t-shirts' },
      // { label: 'Худі', href: '/catalog?category=hoodies' },
      // { label: 'Кепки', href: '/catalog?category=caps' },
    ];

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
          {menuItems.map((item) => (
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

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [authDrawerOpened, { open: openAuthDrawer, close: closeAuthDrawer }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchExpanded(false);
    }
  };

  const handleSearchFocus = () => {
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
        {/* Left section: Menu + Search (Desktop only) */}
        <div className={`${styles.leftSection} ${styles.desktopOnly}`}>
          <button className={styles.iconButton} onClick={toggleDrawer}>
            {drawerOpened ? <IconX /> : <MenuIcon />}
          </button>
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <IconSearch className={styles.searchPlaceholder} />
          </button>
        </div>

        {/* Mobile left: Menu only */}
        <div className={`${styles.leftSection} ${styles.mobileOnly}`}>
          <button className={styles.iconButton} onClick={toggleDrawer}>
            {drawerOpened ? <IconX /> : <MenuIcon />}
          </button>
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <IconSearch className={styles.searchPlaceholder} />
          </button>
        </div>

        {/* Logo (Center) */}
        <Link href="/">
          <Image src={siteConfig.logo} alt={siteConfig.name} className={styles.logo} />
        </Link>

        {/* Right section: Cart + User */}
        <div className={styles.rightSection}>
          <button className={styles.cartButton} onClick={toggleCartDrawer}>
            <IconCart />
            {calculations && calculations.itemsCount > 0 && (
              <Badge size="sm" circle color="red" className={styles.cartIconBadge}>
                {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
              </Badge>
            )}
            <span className={styles.desktopOnly}>{calculations?.itemsCount || 0}</span>
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

// src/widgets/Header/Header.tsx
'use client';
import React, { useState } from 'react';
import {
  IconUser,
  IconLogout,
  IconChevronDown,
  IconSettings,
  IconHeart,
  IconShoppingCart,
  IconSearch,
  IconMenu2,
  IconX,
  IconChevronRight,
} from '@tabler/icons-react';
import { Box, Drawer, Menu, ScrollArea, Stack, Divider, Text, Group, Badge, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { AuthDrawer } from '@/features/auth/components/AuthDrawer/AuthDrawer';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';

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
  ({ onNavigate, onOpenAuth }: { onNavigate?: () => void; onOpenAuth: () => void }) => {
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
      return null;
    }

    if (isAuthenticated && userProfile) {
      return (
        <Menu shadow="md" width={200} classNames={{ dropdown: styles.userMenu }}>
          <Menu.Target>
            <button className={styles.iconButton}>
              <IconUser />
            </button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{content.header.accountMenu.label}</Menu.Label>
            <Menu.Item component={Link} href="/profile" leftSection={<IconUser size={18} />}>
              {content.header.accountMenu.profile}
            </Menu.Item>
            <Menu.Item component={Link} href="/profile/favorites" leftSection={<IconHeart size={18} />}>
              {content.header.accountMenu.favorites}
            </Menu.Item>
            <Menu.Item component={Link} href="/profile/orders" leftSection={<IconShoppingCart size={18} />}>
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

    return (
      <button className={styles.iconButton} onClick={onOpenAuth}>
        <IconUser />
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
      { label: 'Розпродаж', href: '/catalog?sale=true', icon: '🔥' },
      { label: 'ТОП продажів', href: '/catalog?sort=popularity_desc', icon: '⭐' },
      { label: 'Футболки', href: '/catalog?category=t-shirts', icon: '👕' },
      { label: 'Худі', href: '/catalog?category=hoodies', icon: '🧥' },
      { label: 'Кепки', href: '/catalog?category=caps', icon: '🧢' },
      { label: 'Аксесуари', href: '/catalog?category=accessories', icon: '🎒' },
    ];

    return (
      <Drawer opened={opened} onClose={onClose} position="left" size="480px" className={styles.drawer}>
        <ScrollArea h="calc(100vh - 80px)">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.menuLink} onClick={onNavigate}>
              <div className={styles.menuIcon}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <IconChevronRight size={20} />
            </Link>
          ))}

          {isAuthenticated && userProfile && (
            <>
              <Divider my="sm" />
              <Text size="sm" fw={700} p="md" c="dimmed" tt="uppercase">
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Link href="/profile" className={styles.menuLink} onClick={onNavigate}>
                <div className={styles.menuIcon}>
                  <IconUser size={24} />
                  <span>{content.navigation.profile}</span>
                </div>
                <IconChevronRight size={20} />
              </Link>
              <Link href="/profile/favorites" className={styles.menuLink} onClick={onNavigate}>
                <div className={styles.menuIcon}>
                  <IconHeart size={24} />
                  <span>{content.navigation.favorites}</span>
                </div>
                <IconChevronRight size={20} />
              </Link>
              <Link href="/profile/orders" className={styles.menuLink} onClick={onNavigate}>
                <div className={styles.menuIcon}>
                  <IconShoppingCart size={24} />
                  <span>{content.navigation.orders}</span>
                </div>
                <IconChevronRight size={20} />
              </Link>
              {isManager && (
                <>
                  <Divider my="sm" />
                  <Link href="/admin" className={styles.menuLink} onClick={onNavigate}>
                    <div className={styles.menuIcon}>
                      <IconSettings size={24} />
                      <span>{content.navigation.adminPanel}</span>
                    </div>
                    <IconChevronRight size={20} />
                  </Link>
                </>
              )}
              <Divider my="sm" />
              <div className={`${styles.menuLink} ${styles.logoutLink}`} onClick={handleLogoutClick}>
                <div className={styles.menuIcon}>
                  <IconLogout size={24} />
                  <span>{content.navigation.logout}</span>
                </div>
                <IconChevronRight size={20} />
              </div>
            </>
          )}
        </ScrollArea>
      </Drawer>
    );
  }
);

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [authDrawerOpened, { open: openAuthDrawer, close: closeAuthDrawer }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    }
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
            <IconMenu2 />
          </button>
          <form onSubmit={handleSearch} className={styles.searchBox}>
            <IconSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile left: Menu only */}
        <div className={`${styles.leftSection} ${styles.mobileOnly}`}>
          <button className={styles.iconButton} onClick={toggleDrawer}>
            <IconMenu2 />
          </button>
        </div>

        {/* Logo (Center) */}
        <Link href="/">
          <Image src={siteConfig.logo} alt={siteConfig.name} className={styles.logo} />
        </Link>

        {/* Right section: Cart + User */}
        <div className={styles.rightSection}>
          <button className={styles.cartButton} onClick={toggleCartDrawer}>
            <IconShoppingCart />
            {calculations && calculations.itemsCount > 0 && (
              <Badge size="sm" circle color="red" className={styles.cartIconBadge}>
                {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
              </Badge>
            )}
            <span className={styles.desktopOnly}>{calculations?.itemsCount || 0}</span>
          </button>
          <AuthControl onOpenAuth={openAuthDrawer} />
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu opened={drawerOpened} onClose={closeDrawer} onNavigate={closeDrawer} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Drawer */}
      <AuthDrawer opened={authDrawerOpened} onClose={closeAuthDrawer} onSuccess={handleAuthSuccess} />
    </Box>
  );
}

// src/widgets/Header/Header.tsx - OPTIMIZED
'use client';
import React from 'react';
import {
  IconUser,
  IconLogout,
  IconChevronDown,
  IconSettings,
  IconHeart,
  IconShoppingCart,
} from '@tabler/icons-react';
import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Image,
  Badge,
  ActionIcon,
  Menu,
  Text,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { useAuthStore } from '@/shared/stores/auth';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { CartIcon } from './CartIcon';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import { PromoBanner } from './PromoBanner';
import { SearchSection } from './SearchSection';

// ✅ ОПТИМІЗОВАНО: React.memo запобігає непотрібним ререндерам
const CartIconWithBadge = React.memo(({ isMobile = false }: { isMobile?: boolean }) => {
  const { toggle } = useCartDrawerActions();
  const calculations = useCartCalculations();

  return (
    <ActionIcon
      variant="unstyled"
      className={isMobile ? styles.buttonMobile : styles.button}
      onClick={toggle}>
      <CartIcon />
      {calculations && calculations.itemsCount > 0 && (
        <Badge size="sm" circle color="red" className={styles.cartIconBadge}>
          {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
        </Badge>
      )}
    </ActionIcon>
  );
});

// SINGLE logout handler
const useLogoutHandler = () => {
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    await logout();
    window.location.href = '/';
  };
};

// ✅ ОПТИМІЗОВАНО: React.memo
const AuthControl = React.memo(({ onNavigate }: { onNavigate?: () => void }) => {
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
    return (
      <Link href="/login" className={styles.link} onClick={onNavigate}>
        <span>{content.navigation.account}</span>
      </Link>
    );
  }

  if (isAuthenticated && userProfile) {
    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button rightSection={<IconChevronDown size={14} />} variant="unstyled" className={styles.button}>
            <Group>
              <IconUser size={16} />
              <Text size="sm" className={styles.link_user}>
                {userProfile.firstName}
              </Text>
            </Group>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{content.header.accountMenu.label}</Menu.Label>
          <Menu.Item component={Link} href="/profile" leftSection={<IconUser size={24} />}>
            {content.header.accountMenu.profile}
          </Menu.Item>
          <Menu.Item component={Link} href="/profile/favorites" leftSection={<IconHeart />}>
            {content.header.accountMenu.favorites}
          </Menu.Item>
          <Menu.Item component={Link} href="/profile/orders" leftSection={<IconShoppingCart />}>
            {content.header.accountMenu.orders}
          </Menu.Item>
          {isManager && (
            <>
              <Menu.Divider />
              <Menu.Label>{content.header.accountMenu.management}</Menu.Label>
              <Menu.Item component={Link} href="/admin" leftSection={<IconSettings size={14} />}>
                {content.header.accountMenu.adminPanel}
              </Menu.Item>
            </>
          )}
          <Menu.Divider />
          <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogoutClick}>
            {content.header.accountMenu.logout}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Link href="/login" className={styles.link} onClick={onNavigate}>
      {content.navigation.account}
    </Link>
  );
});

// ✅ ОПТИМІЗОВАНО: React.memo
const MobileAuthMenu = React.memo(({ onNavigate }: { onNavigate: () => void }) => {
  const userProfile = useAuthStore((state) => state.userProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const handleLogout = useLogoutHandler();

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
  const isManager = userProfile?.role === 'MANAGER' || isAdmin;

  const handleLogoutClick = async () => {
    onNavigate();
    await handleLogout();
  };

  if (!isInitialized || !isAuthenticated || !userProfile) {
    return (
      <Link href="/login" className={styles.link} onClick={onNavigate}>
        {content.navigation.account}
      </Link>
    );
  }

  return (
    <Stack gap={0}>
      <Divider my="sm" />
      <Text size="sm" fw={700} p="md" c="dimmed" tt="uppercase">
        {userProfile.firstName} {userProfile.lastName}
      </Text>
      <Link href="/profile" className={styles.link} onClick={onNavigate}>
        <Group gap="xs">
          <IconUser size={18} />
          <span>{content.navigation.profile.toUpperCase()}</span>
        </Group>
      </Link>
      <Link href="/profile/favorites" className={styles.link} onClick={onNavigate}>
        <Group gap="xs">
          <IconHeart size={18} />
          <span>{content.navigation.favorites.toUpperCase()}</span>
        </Group>
      </Link>
      <Link href="/profile/orders" className={styles.link} onClick={onNavigate}>
        <Group gap="xs">
          <IconShoppingCart size={18} />
          <span>{content.navigation.orders.toUpperCase()}</span>
        </Group>
      </Link>
      {isManager && (
        <>
          <Divider my="sm" />
          <Text size="sm" fw={700} p="md" c="dimmed" tt="uppercase">
            {content.header.accountMenu.management}
          </Text>
          <Link href="/admin" className={styles.link} onClick={onNavigate}>
            <Group gap="xs">
              <IconSettings size={18} />
              <span>{content.navigation.adminPanel.toUpperCase()}</span>
            </Group>
          </Link>
        </>
      )}
      <Divider my="sm" />
      <div className={`${styles.link} ${styles.logoutLink}`} onClick={handleLogoutClick}>
        <Group gap="xs">
          <IconLogout size={18} />
          <span>{content.navigation.logout.toUpperCase()}</span>
        </Group>
      </div>
    </Stack>
  );
});

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const userProfile = useAuthStore((state) => state.userProfile);
  const syncCart = useCartStore((state) => state.syncCart);

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  return (
    <Box className={styles.wrapper}>
      <header className={styles.header}>
        <Group justify="space-between" h="100%" className={styles.nav}>
          <Group h="100%" gap={30} visibleFrom="md">
            <Link href="/" className={styles.link}>
              {content.navigation.home}
            </Link>
            <Link href="/catalog" className={styles.link}>
              {content.navigation.shop}
            </Link>
            <Link href="/about" className={styles.link}>
              {content.navigation.about}
            </Link>
          </Group>
          <Link href="/">
            <Image src={siteConfig.logo} alt={siteConfig.name} className={styles.logo} />
          </Link>
          <Group visibleFrom="md" gap={30}>
            <Link href="/contact" className={styles.link}>
              {content.navigation.contacts}
            </Link>
            <div className={styles.link}>
              <CartIconWithBadge />
            </div>
            <AuthControl />
          </Group>
          <Group h="100%" gap={30} hiddenFrom="md">
            <CartIconWithBadge isMobile={true} />
            <Burger color="#ffffff" opened={drawerOpened} onClick={toggleDrawer} />
          </Group>
        </Group>
      </header>
      <SearchSection />
      <PromoBanner />
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="280px"
        padding="md"
        title={content.header.navigation}
        hiddenFrom="md"
        zIndex={1000}>
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />
          <Link href="/catalog" className={styles.link} onClick={closeDrawer}>
            {content.navigation.shop}
          </Link>
          <Link href="/about" className={styles.link} onClick={closeDrawer}>
            {content.navigation.about}
          </Link>
          <Link href="/contact" className={styles.link} onClick={closeDrawer}>
            {content.navigation.contacts}
          </Link>
          <Group
            className={styles.link}
            onClick={() => {
              closeDrawer();
              toggleCartDrawer();
            }}
            style={{ cursor: 'pointer' }}>
            <span>{content.navigation.cart}</span>
            {calculations && calculations.itemsCount > 0 && (
              <Badge size="sm" color="red">
                {calculations.itemsCount}
              </Badge>
            )}
          </Group>

          <MobileAuthMenu onNavigate={closeDrawer} />
        </ScrollArea>
      </Drawer>
      <CartDrawer />
    </Box>
  );
}

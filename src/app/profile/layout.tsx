'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth';
import { Button } from '@/shared/components/Button/Button';
import { Container, Grid, Paper, Stack, Text, NavLink, Box, LoadingOverlay, Alert } from '@mantine/core';
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

  // Show loading while checking auth

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Profile error - show retry option

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Paper p="md" className={styles.sidebar}>
              <Stack gap="xs">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      component={Link}
                      href={item.href}
                      label={item.label}
                      leftSection={<IconComponent size={20} />}
                      active={item.active}
                      className={styles.navItem}
                    />
                  );
                })}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Paper p="md" className={styles.content}>
              {children}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

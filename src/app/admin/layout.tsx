// src/app/admin/layout.tsx - FIXED VERSION
'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppShell,
  NavLink,
  Text,
  Group,
  Stack,
  Burger,
  ScrollArea,
  UnstyledButton,
  Avatar,
  Menu,
  LoadingOverlay,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconPackage,
  IconShoppingCart,
  IconUsers,
  IconLogout,
  IconChevronRight,
  IconBell,
  IconUserCircle,
  IconHome,
} from '@tabler/icons-react';
import { useAuthStore } from '@/shared/stores/auth';
import '@/shared/api/client';
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure();

  const { userProfile, isAuthenticated, isInitialized, isLoading, logout } = useAuthStore();

  // Check admin access
  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
  const isManager = userProfile?.role === 'MANAGER' || isAdmin;
  const hasAccess = isAuthenticated && isManager;
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !isManager) {
      router.push('/');
    }
  }, [isAuthenticated, isManager, isInitialized, router]);
  // ВИПРАВЛЕНО: не блокуємо UI якщо є профіль

  const navItems = [
    {
      label: 'Dashboard',
      icon: IconDashboard,
      href: '/admin',
      color: 'blue',
    },
    {
      label: 'Товари',
      icon: IconPackage,
      href: '/admin/products',
      color: 'green',
    },
    {
      label: 'Категорії товару',
      icon: IconPackage,
      href: '/admin/categories',
      color: 'green',
    },
    {
      label: 'Знижки',
      icon: IconBell,
      href: '/admin/discounts',
      color: 'yellow',
    },
    {
      label: 'Замовлення',
      icon: IconShoppingCart,
      href: '/admin/orders',
      color: 'orange',
    },
    {
      label: 'Відгуки',
      icon: IconShoppingCart,
      href: '/admin/reviews',
      color: 'orange',
    },
    ...(isAdmin
      ? [
          {
            label: 'Користувачі',
            icon: IconUsers,
            href: '/admin/users',
            color: 'violet',
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="lg"
      styles={{
        main: {
          background: '#fff',
          color: '#000',
        },
        navbar: {
          paddingTop: '50px',
          background: '#1a1a1a',
          borderColor: '#333',
        },
        header: {
          background: '#000',
          borderColor: '#333',
        },
      }}>
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#fff" />
            <Text size="lg" fw={700} c="#fff">
              Адмін панель
            </Text>
          </Group>

          <Group>
            <UnstyledButton p={4} onClick={() => router.push('/')} style={{ color: '#fff' }}>
              <IconHome size={20} stroke={1.5} />
            </UnstyledButton>

            <Menu position="bottom-end" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar size="sm" color="blue">
                      {userProfile?.firstName?.[0]}
                      {userProfile?.lastName?.[0]}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} c="#fff">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </Text>
                      <Text size="xs" c="#999">
                        {isAdmin ? 'Адміністратор' : 'Менеджер'}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUserCircle size={16} />} onClick={() => router.push('/profile')}>
                  Профіль
                </Menu.Item>
                <Menu.Item leftSection={<IconHome size={16} />} onClick={() => router.push('/')}>
                  На сайт
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                  Вийти
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<item.icon size={20} />}
                rightSection={<IconChevronRight size={16} />}
                onClick={() => router.push(item.href)}
                active={pathname === item.href}
                variant="subtle"
                color={item.color}
                styles={{
                  root: {
                    borderRadius: 8,
                    color: '#e0ddca',
                    '&:hover': {
                      background: '#33603b',
                      color: '#e6db1b',
                    },
                    '&[dataActive="true"]': {
                      background: '#33603b',
                      color: '#e6db1b',
                      fontWeight: 600,
                    },
                  },
                  label: {
                    color: 'inherit',
                  },
                }}
              />
            ))}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main> {children}</AppShell.Main>
    </AppShell>
  );
}

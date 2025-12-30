'use client';

import { Container, Title, Stack, Text, Card, Group, Avatar, Box } from '@mantine/core';
import { IconUser, IconShoppingBag, IconHeart, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import { useTelegramAuthStore } from '@/shared/stores/telegram-auth';
import { Button } from '@/shared/components/Button/Button';
import styles from './telegramProfile.module.scss';

export default function TelegramProfilePage() {
  const { userProfile, isAuthenticated, logout } = useTelegramAuthStore();

  if (!isAuthenticated || !userProfile) {
    return (
      <Container size="lg" p="md">
        <Stack align="center" gap="md" py="xl">
          <IconUser size={80} color="var(--mantine-color-gray-5)" />
          <Text size="lg" c="dimmed">
            Увійдіть в систему, щоб переглянути профіль
          </Text>
        </Stack>
      </Container>
    );
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/telegram';
  };

  return (
    <div className={styles.container}>
      {/* Профіль користувача */}
      <Card className={styles.profileCard} mb="md">
        <Group>
          <Avatar size="lg" color="yellow">
            {userProfile.firstName[0]}
            {userProfile.lastName?.[0]}
          </Avatar>
          <Box>
            <Title order={3}>
              {userProfile.firstName} {userProfile.lastName}
            </Title>
            {userProfile.username && (
              <Text size="sm" c="dimmed">
                @{userProfile.username}
              </Text>
            )}
          </Box>
        </Group>
      </Card>

      {/* Меню */}
      <Stack gap="sm">
        <Card component={Link} href="/telegram/profile/orders" className={styles.menuItem}>
          <Group>
            <IconShoppingBag size={24} />
            <Box flex={1}>
              <Text fw={600}>Мої замовлення</Text>
              <Text size="sm" c="dimmed">
                Історія замовлень
              </Text>
            </Box>
          </Group>
        </Card>

        <Card component={Link} href="/telegram/profile/favorites" className={styles.menuItem}>
          <Group>
            <IconHeart size={24} />
            <Box flex={1}>
              <Text fw={600}>Обрані товари</Text>
              <Text size="sm" c="dimmed">
                Список бажань
              </Text>
            </Box>
          </Group>
        </Card>

        <Card className={styles.menuItem} onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <Group>
            <IconLogout size={24} color="red" />
            <Box flex={1}>
              <Text fw={600} c="red">
                Вийти
              </Text>
            </Box>
          </Group>
        </Card>
      </Stack>
    </div>
  );
}

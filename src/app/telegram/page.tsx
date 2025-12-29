'use client';

import { useRouter } from 'next/navigation';
import { Box, Title, Text, Container } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { useTelegramAuthStore } from '@/shared/stores/telegram-auth';

export default function TelegramHomePage() {
  const router = useRouter();
  const { userProfile, isAuthenticated } = useTelegramAuthStore();

  return (
    <Container size="sm" py="xl">
      <Box style={{ textAlign: 'center', paddingTop: '60px' }}>
        <Title order={1} mb="md" style={{ fontSize: '2rem', fontWeight: 700 }}>
          Вітаємо в Shop Sausages! 🥩
        </Title>

        {isAuthenticated && userProfile && (
          <Text size="lg" mb="xl" c="dimmed">
            Привіт, {userProfile.firstName}! 👋
          </Text>
        )}

        <Text size="lg" mb="xl" c="dimmed">
          Найкращі м'ясні вироби прямо в Telegram
        </Text>

        <Button size="lg" variant="yellow" onClick={() => router.push('/telegram/catalog')} fullWidth>
          Перейти до каталогу
        </Button>

        <Box mt="xl" p="md" style={{ background: '#f5f5f5', borderRadius: '8px' }}>
          <Text size="sm" c="dimmed">
            ⚡️ Швидке оформлення замовлення
            <br />
            🚚 Доставка по всій Україні
            <br />
            💳 Зручна оплата
          </Text>
        </Box>
      </Box>
    </Container>
  );
}

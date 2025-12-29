'use client';

import { Container, Title, Stack, Group, Text, Center, Box } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem/CartItem';
import { formatPrice } from '@/shared/utils/cart-calculations';
import { Button } from '@/shared/components/Button/Button';
import styles from './telegramCart.module.scss';

export default function TelegramCartPage() {
  const router = useRouter();
  const { items, calculations, isLoading, clearCart, isClearingCart, error } = useCart();

  if (error) {
    return (
      <Container size="lg" p="md">
        <Center py="xl">
          <Stack align="center" gap="md">
            <Text c="red">Помилка завантаження кошика</Text>
            <Button onClick={() => window.location.reload()}>Спробувати знову</Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" p="md">
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Box>
          <Title order={2}>Кошик</Title>
          <Text size="sm" c="dimmed">
            {calculations.itemsCount} {calculations.itemsCount === 1 ? 'товар' : 'товари'}
          </Text>
        </Box>

        {items.length > 0 && (
          <Button variant="red" size="sm" loading={isClearingCart} onClick={clearCart}>
            Очистити
          </Button>
        )}
      </Group>

      {items.length === 0 ? (
        /* Порожній кошик */
        <Center py="xl">
          <Stack align="center" gap="xl" maw={400}>
            <IconShoppingCart size={80} color="var(--mantine-color-gray-5)" />

            <Stack align="center" gap="sm">
              <Title order={3} ta="center" c="dimmed">
                Ваш кошик порожній
              </Title>
              <Text ta="center" c="dimmed">
                Додайте товари до кошика, щоб продовжити покупки
              </Text>
            </Stack>

            <Button onClick={() => router.push('/telegram/catalog')}>Перейти до каталогу</Button>
          </Stack>
        </Center>
      ) : (
        /* Заповнений кошик */
        <div className={styles.cartContent}>
          {/* Список товарів */}
          <Stack gap="sm" mb="md">
            {items.map((item, index) => (
              <CartItem key={item.id} item={item} compact={true} isFirst={index === 0} />
            ))}
          </Stack>

          {/* Підсумок замовлення */}
          <Box className={styles.summary}>
            <Title order={4} mb="md">
              Всього
            </Title>

            <Stack gap="xs" mb="md">
              <Group justify="space-between">
                <Text size="sm">Товари ({calculations.itemsCount})</Text>
                <Text size="sm" fw={600}>
                  {formatPrice(calculations.subtotal)}
                </Text>
              </Group>

              {calculations.discountAmount && calculations.discountAmount > 0 && (
                <Group justify="space-between">
                  <Text size="sm" c="green">
                    Знижка
                  </Text>
                  <Text size="sm" c="green" fw={600}>
                    -{formatPrice(calculations.discountAmount)}
                  </Text>
                </Group>
              )}

              <Group justify="space-between" mt="sm" pt="sm" style={{ borderTop: '1px solid #e0e0e0' }}>
                <Text fw={700}>До сплати</Text>
                <Text fw={700} size="xl" c="yellow">
                  {formatPrice(calculations.totalAmount)}
                </Text>
              </Group>
            </Stack>

            <Button fullWidth size="lg" onClick={() => router.push('/telegram/checkout')}>
              Оформити замовлення
            </Button>
          </Box>
        </div>
      )}
    </Container>
  );
}

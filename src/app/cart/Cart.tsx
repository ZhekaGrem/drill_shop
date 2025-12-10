// src/app/(shop)/cart/page.tsx

'use client';
import { Container, Title, Stack, Group, Text, Paper, Divider, Center } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { ArrowLeft } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem/CartItem';
import { formatPrice } from '@/shared/utils/cart-calculations';
import Link from 'next/link';

import { Button } from '@/shared/components/Button/Button';
import styles from './Cart.module.scss';
export default function CartPage() {
  const { items, calculations, isLoading, clearCart, isClearingCart, error } = useCart();

  if (error) {
    return (
      <Container size="lg">
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
    <Container size="lg" className={styles.containerCart}>
      {/* Header */}
      <Group justify="space-between" p="xs">
        <Group justify="space-between">
          {' '}
          <Link href="/catalog" className={styles.containerCart__link}>
            {' '}
            <ArrowLeft />{' '}
            <Title order={1} className={styles.containerCart__title}>
              {' '}
              Кошик
            </Title>
          </Link>{' '}
          <Text> {calculations.itemsCount} товари</Text>
        </Group>

        {items.length > 0 && (
          <Button variant="red" size="promo" loading={isClearingCart} onClick={clearCart}>
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
              <Title order={2} ta="center" c="dimmed">
                Ваш кошик порожній
              </Title>
              <Text ta="center" c="dimmed">
                Додайте товари до кошика, щоб продовжити покупки
              </Text>
            </Stack>

            <Group gap="sm" justify="center">
              <Link href="/">
                <Button variant="ghost" leftSection={<ArrowLeft />}>
                  На головну
                </Button>
              </Link>
              <Link href="/catalog">
                <Button>Перейти до каталогу</Button>
              </Link>
            </Group>
          </Stack>
        </Center>
      ) : (
        /* Заповнений кошик */
        <div className={styles.cart}>
          {/* Список товарів */}
          <Stack flex={1} gap={0}>
            {items.map((item, index) => (
              <CartItem key={item.id} item={item} compact={false} isFirst={index === 0} />
            ))}
          </Stack>

          {/* Зелена вертикальна лінія */}
          <div className={styles.divider} />

          {/* Підсумок замовлення */}
          <Stack gap="md" flex={1} p={20} pos="sticky" top={20} className={styles.summary}>
            <Title order={3}>Всього</Title>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text>Товари {calculations.itemsCount} на суму</Text>{' '}
                <Text>{formatPrice(calculations.subtotal)}</Text>
              </Group>
            </Stack>

            <Divider />

            <Group justify="space-between" className={styles.totalSection}>
              <Text fw={700} size="lg">
                Загалом:
              </Text>
              <Text fw={900} className={styles.totalSection__price}>
                {formatPrice(calculations.totalAmount)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Доставка:
              </Text>
              <Text size="sm" c="dimmed">
                За тарифами служби доставки
              </Text>
            </Group>
            <Stack gap="sm" mt="md">
              <Link href="/checkout">
                <Button variant="primary" size="lg" fullWidth>
                  <span className={styles.checkoutButtonText}>
                    <span className={styles.desktopText}>Перейти до оформлення</span>
                    <span className={styles.mobileText}>Оформити</span>
                  </span>
                </Button>
              </Link>
            </Stack>

            {/* Інформація про доставку */}
            <Stack gap="xs" mt="lg">
              <Text size="sm" fw={500} c="dimmed">
                Інформація:
              </Text>

              <Text size="xs" c="dimmed">
                • Доставка протягом 1-2 днів
              </Text>
              <Text size="xs" c="dimmed">
                • Можливість оплати при отриманні
              </Text>
            </Stack>
          </Stack>
        </div>
      )}
    </Container>
  );
}

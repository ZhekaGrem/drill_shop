// src/app/(shop)/cart/page.tsx

'use client';
import {
  Container,
  Title,
  Stack,
  Group,
  Text,
  Paper,
  Divider,
  Center,
  Loader,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { IconShoppingCart, IconArrowLeft } from '@tabler/icons-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem/CartItem';
import { formatPrice } from '@/shared/utils/cart-calculations';
import Link from 'next/link';

import { Button } from '@/shared/components/Button/Button';
export default function CartPage() {
  const { items, calculations, isLoading, clearCart, isClearingCart, error } = useCart();

  // Breadcrumbs
  const breadcrumbItems = [
    { title: 'Головна', href: '/' },
    { title: 'Кошик', href: '/cart' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (error) {
    return (
      <Container size="lg" py="xl">
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
    <Container size="lg" py="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="lg">{breadcrumbItems}</Breadcrumbs>

      {/* Header */}
      <Group justify="space-between" mb="xl">
        <h1>Кошик</h1>

        {items.length > 0 && (
          <Button
            variant="outline"
            rightSection={<IconShoppingCart size={22} />}
            loading={isClearingCart}
            onClick={clearCart}>
            Очистити кошик
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
                <Button variant="ghost" leftSection={<IconArrowLeft size={16} />}>
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
        <Group align="flex-start" gap="xl">
          {/* Список товарів */}
          <Stack flex={1} gap="md">
            <Paper p="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text fw={500}>Товари в кошику ({calculations.itemsCount})</Text>
                <Text size="sm" c="dimmed">
                  Загальна кількість: {calculations.totalQuantity} шт
                </Text>
              </Group>

              <Stack gap="md">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </Stack>
            </Paper>
          </Stack>

          {/* Підсумок замовлення */}
          <Paper p="xl" withBorder miw={300} pos="sticky" top={20}>
            <Stack gap="md">
              <Title order={3}>Підсумок замовлення</Title>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>Товари ({calculations.itemsCount})</Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Доставка:
                  </Text>
                  <Text size="sm" c="dimmed">
                    За тарифами служби доставки
                  </Text>
                </Group>
              </Stack>

              <Divider />

              <Group justify="space-between">
                <Text fw={700} size="lg">
                  Загалом:
                </Text>
                <Text fw={700} size="xl" c="var(--primary)">
                  {formatPrice(calculations.totalAmount)}
                </Text>
              </Group>

              <Stack gap="sm" mt="md">
                <Link href="/checkout">
                  <Button variant="primary" size="lg" fullWidth>
                    Оформити замовлення
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button variant="primary" size="lg" fullWidth>
                    Продовжити покупки
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
          </Paper>
        </Group>
      )}
    </Container>
  );
}

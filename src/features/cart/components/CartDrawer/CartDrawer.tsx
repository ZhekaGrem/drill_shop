// src/features/cart/components/CartDrawer.tsx - Mobile optimized

'use client';
import { Drawer, Text, ScrollArea, Stack, Group, Divider, Loader, Center, Box, em } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconShoppingCart } from '@tabler/icons-react';
import { useCartDrawerState, useCartDrawerActions } from '@/shared/stores/cart';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '../CartItem/CartItem';
import { formatPrice } from '@/shared/utils/cart-calculations';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import styles from './CartDrawer.module.scss';

export const CartDrawer = () => {
  const isOpen = useCartDrawerState();
  const { close } = useCartDrawerActions();
  const { items, calculations, isLoading, error, clearCart, isClearingCart } = useCart();

  // Mobile detection
  const isMobile = useMediaQuery(`(max-width: ${em(768)})`);

  // Safe check for items
  const hasItems = items && items.length > 0;

  return (
    <Drawer
      opened={isOpen}
      onClose={close}
      title="Кошик"
      position="right"
      size={isMobile ? '100%' : 'lg'} // Full width on mobile
      overlayProps={{ opacity: 0.5, blur: 4 }}
      styles={{
        header: {
          padding: isMobile ? '16px 20px' : undefined,
          backgroundColor: 'var(--background)',
        },
        body: {
          padding: isMobile ? '0' : undefined,
          height: '100%',
          backgroundColor: 'var(--background)',
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}>
      <Stack h="100%" justify="space-between" gap={0} className={styles.drawer}>
        {error && (
          <Box p="md" className={styles.body}>
            <Text size="sm" c="red">
              {error}
            </Text>
          </Box>
        )}
        {hasItems && (
          <Box p={isMobile ? '16px 20px' : 'md'}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {calculations.itemsCount} товар(ів)
              </Text>
              <Button variant="red" size="promo" color="red" loading={isClearingCart} onClick={clearCart}>
                Очистити
              </Button>
            </Group>
          </Box>
        )}

        {/* Content */}
        <ScrollArea
          flex={1}
          offsetScrollbars
          styles={{
            viewport: {
              padding: isMobile ? '16px 20px' : '16px',
            },
          }}>
          {!hasItems ? (
            <Center py="xl">
              <Stack align="center">
                <IconShoppingCart size={isMobile ? 64 : 48} color="var(--text-secondary)" />
                <Text c="dimmed" ta="center" size={isMobile ? 'md' : 'sm'}>
                  Ваш кошик порожній
                </Text>
                <Link href="/catalog">
                  <Button onClick={close} size={isMobile ? 'md' : 'sm'}>
                    Перейти до покупок
                  </Button>
                </Link>
              </Stack>
            </Center>
          ) : (
            <Stack gap={0}>
              {items.map((item) => (
                <CartItem key={item.id} item={item} compact={true} />
              ))}
            </Stack>
          )}
        </ScrollArea>

        {/* Footer with total and checkout */}
        {hasItems && (
          <Stack gap="md" pt="md">
            <Divider className={styles.divider} />

            <Group justify="space-between" p="md">
              <Text fw={700} size="lg">
                Загалом:
              </Text>
              <Text fw={700} size="xl">
                {formatPrice(calculations.totalAmount)}
              </Text>
            </Group>

            <Stack gap="xs" p="md">
              <Link href="/checkout">
                <Button size="lg" fullWidth onClick={close}>
                  Оформити замовлення
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="primary" size="lg" fullWidth onClick={close}>
                  Переглянути кошик
                </Button>
              </Link>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
};

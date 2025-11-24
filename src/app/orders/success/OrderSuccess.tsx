'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, Stack, Badge, Timeline, Alert } from '@mantine/core';
import { IconCircleCheck, IconPackage, IconMail, IconClock, IconShoppingCart } from '@tabler/icons-react';

const OrderSuccess = () => {
  const searchParams = useSearchParams();

  // Extract order details from URL params
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const customerEmail = searchParams.get('email');
  const totalAmount = searchParams.get('total');

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="xl">
          {/* Success Icon */}
          <IconCircleCheck size={100} color="var(--success)" />

          {/* Main Success Message */}
          <Stack align="center" gap="md">
            <Title order={1} ta="center" c="var(--success)">
              Дякуємо за ваше замовлення!
            </Title>

            <Text size="lg" ta="center" c="var(--text-secondary)">
              Замовлення
            </Text>
            <Badge size="lg" variant="light" color="green">
              #{orderNumber || orderId || '...'}
            </Badge>

            <Text size="lg" ta="center" c="var(--text-secondary)">
              було успішно оформлено
            </Text>
          </Stack>

          {/* Order Details Card */}
          <Paper
            p="lg"
            withBorder
            radius="md"
            w="100%"
            bg="var(--background-secondary)"
            style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Group justify="center">
                <IconPackage size={20} color="var(--primary)" />
                <Text fw={600} c="var(--text-primary)">
                  Деталі замовлення
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="var(--text-secondary)">
                  Номер замовлення:
                </Text>
                <Text fw={500} ff="monospace">
                  {orderNumber || orderId || 'Завантажується...'}
                </Text>
              </Group>

              {totalAmount && (
                <Group justify="space-between">
                  <Text size="sm" c="var(--text-secondary)">
                    Сума замовлення:
                  </Text>
                  <Text fw={600} c="var(--primary)">
                    {totalAmount} ₴
                  </Text>
                </Group>
              )}

              {customerEmail && (
                <Group justify="space-between">
                  <Text size="sm" c="var(--text-secondary)">
                    Email:
                  </Text>
                  <Text size="sm">{customerEmail}</Text>
                </Group>
              )}
            </Stack>
          </Paper>

          {/* What happens next */}

          {/* Order Process Timeline */}

          {/* Action Buttons */}
          <Group w="100%" grow>
            {orderNumber && (
              <Button
                component={Link}
                href={`/orders/track/${orderNumber}`}
                variant="outline"
                color="var(--primary)"
                leftSection={<IconPackage size={16} />}>
                Відстежити замовлення
              </Button>
            )}

            <Button
              component={Link}
              href="/catalog"
              leftSection={<IconShoppingCart size={16} />}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
              }}>
              Продовжити покупки
            </Button>
          </Group>

          {/* Support Contact */}
          <Text ta="center" size="sm" c="var(--text-secondary)">
            Маєте питання? Зверніться до нашої{' '}
            <Text
              component={Link}
              href="/contact"
              c="var(--primary)"
              td="underline"
              style={{ textDecoration: 'underline' }}>
              служби підтримки
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default OrderSuccess;

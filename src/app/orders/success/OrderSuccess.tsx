'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, Group, Stack, Badge, Image } from '@mantine/core';
import { IconCircleCheck, IconPackage, IconShoppingCart } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';

import styles from './orderSuccess.module.scss';

const OrderSuccess = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const customerEmail = searchParams.get('email');
  const totalAmount = searchParams.get('total');

  return (
    <Container size="md">
      <Stack align="center" gap="xl">
        <Image src="/assets/img/smile.png"
                      alt="Hero"
                      height={200}
                      fit="contain"
                      radius="md"
                      className={styles.image} />

        <Title className={styles.title}>ДЯКУЄМО ЗА ЗАМОВЛЕННЯ!</Title>

        <Stack align="center" gap="md">
          <Text className={styles.subtitle}>Замовлення</Text>
          <Badge size="xl" className={styles.orderBadge}>
            #{orderNumber || orderId || '...'}
          </Badge>
          <Text className={styles.subtitle}>успішно оформлено</Text>
        </Stack>

        <Paper p="xl" withBorder className={styles.detailsCard}>
          <Stack gap="md">
            <Group justify="center" mb="md">
              <IconPackage size={20} />
              <Text fw={600} className={styles.cardTitle}>
                ДЕТАЛІ ЗАМОВЛЕННЯ
              </Text>
            </Group>

            <Group justify="center" className={styles.detailRow}>
              <Text>Номер замовлення:</Text>
              <Text fw={500} ff="monospace">
                {orderNumber || orderId || 'Завантажується...'}
              </Text>
            </Group>

            {totalAmount && (
              <Group justify="space-between" className={styles.detailRow}>
                <Text>Сума замовлення:</Text>
                <Text fw={700} className={styles.amount}>
                  {totalAmount} ₴
                </Text>
              </Group>
            )}

            {customerEmail && (
              <Group justify="space-between" className={styles.detailRow}>
                <Text>Email:</Text>
                <Text size="sm">{customerEmail}</Text>
              </Group>
            )}
          </Stack>
        </Paper>

        {orderNumber && (
          <Link href={`/orders/track/${orderNumber}`}>
            <Button
              variant="primary"
              size="lg"
              leftSection={<IconPackage size={16} />}
              className={styles.button}>
              Відстежити замовлення
            </Button>
          </Link>
        )}
        <Link href={`/catalog`}>
          <Button size="lg" className={styles.primaryButton}>
            Продовжити покупки
          </Button>
        </Link>

        <Text ta="center" size="sm" c="dimmed">
          Маєте питання?{' '}
          <Text component={Link} href="/contact" td="underline" span c="var(--text-yellow)">
            Зверніться до нашої служби підтримки
          </Text>
        </Text>
      </Stack>
    </Container>
  );
};

export default OrderSuccess;

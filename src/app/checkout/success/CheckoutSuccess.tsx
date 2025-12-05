// src/pages/Checkout/CheckoutSuccess/CheckoutSuccess.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Title, Text, Group, Stack, Center, Loader, Image } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import styles from './CheckoutSuccess.module.scss';
const CheckoutSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  if (!orderId || !orderNumber) {
    return (
      <Container size="sm" py="xl">
        <Center h={200}>
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <div className={styles.successPage}>
      <Container size="sm" py="xl">
        <Paper className={styles.wrapper}>
          <Stack align="center" gap="lg">
            <Image
              src="/assets/img/smile.png"
              alt="Hero"
              height={200}
              fit="contain"
              radius="md"
              className={styles.image}
            />

            <Title order={2} ta="center" c="green">
              Замовлення успішно створено!
            </Title>

            <Text ta="center">Дякуємо за покупку! Ми вже почали обробляти ваше замовлення.</Text>

            <Text ta="center" c="dimmed">
              Найближчим часом наш менеджер зв'яжеться з вами для підтвердження. Ви отримаєте SMS з деталями
              доставки.
            </Text>

            <Paper p="md" withBorder radius="md" w="100%" bg="green.0">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Номер замовлення:
                </Text>
                <Text size="sm" fw={500} ff="monospace">
                  {orderNumber}
                </Text>
              </Group>

              <Group justify="space-between" mt="xs">
                <Text size="sm" c="dimmed">
                  ID замовлення:
                </Text>
                <Text size="sm" ff="monospace">
                  {orderId}
                </Text>
              </Group>
            </Paper>

            <Group w="100%">
              <Link href="/">
                <Button variant="primary" flex={1}>
                  На головну
                </Button>
              </Link>
              <Link href={`/orders/track/${orderNumber}`}>
                <Button variant="outline" flex={1}>
                  Відстежити замовлення
                </Button>
              </Link>
            </Group>

            <Text ta="center" size="sm" c="dimmed">
              Також ви можете переглянути статус замовлення в{' '}
              <Text component={Link} href="/profile/orders" c="blue" td="underline">
                особистому кабінеті
              </Text>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default CheckoutSuccessPage;

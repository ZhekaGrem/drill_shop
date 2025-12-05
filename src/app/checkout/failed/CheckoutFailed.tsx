// src/pages/Checkout/CheckoutFailed/CheckoutFailed.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Title, Text, Group, Stack, Alert, Image } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button'
import styles from './CheckoutFailed.module.scss';
const CheckoutFailedPage: React.FC = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CART_EMPTY':
        return 'Ваш кошик порожній';
      case 'INVENTORY_ERROR':
        return 'Деякі товари закінчилися на складі';
      case 'PAYMENT_ERROR':
        return 'Помилка обробки оплати';
      case 'VALIDATION_ERROR':
        return 'Некоректні дані замовлення';
      case 'SERVER_ERROR':
        return 'Тимчасова технічна помилка';
      default:
        return error || 'Невідома помилка при оформленні замовлення';
    }
  };

  return (
    <div className={styles.failedPage}>
      <Container size="sm"  >
        <Paper className={styles.wrapper}>
          <Stack align="center" gap="lg">
            <Image src="/assets/img/rage.png" alt="Hero" height={200} fit="contain" radius="md" className={styles.image} />

            <Title order={2} ta="center" c="red">
              Помилка оформлення замовлення
            </Title>

            <Text ta="center" size="lg">
              {getErrorMessage(error)}
            </Text>

            <Text ta="center" c="dimmed">
              На жаль, не вдалося оформити ваше замовлення. Перевірте дані та спробуйте ще раз.
            </Text>

            {/* Order details if available */}
            {(orderId || orderNumber) && (
              <Paper p="md" withBorder radius="md" w="100%" bg="red.0">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Статус:
                  </Text>
                  <Text size="sm" c="red" fw={500}>
                    Помилка
                  </Text>
                </Group>

                {orderNumber && (
                  <Group justify="space-between" mt="xs">
                    <Text size="sm" c="dimmed">
                      Номер замовлення:
                    </Text>
                    <Text size="sm" ff="monospace">
                      {orderNumber}
                    </Text>
                  </Group>
                )}

                {error && (
                  <Group justify="space-between" mt="xs">
                    <Text size="sm" c="dimmed">
                      Код помилки:
                    </Text>
                    <Text size="sm" ff="monospace">
                      {error}
                    </Text>
                  </Group>
                )}
              </Paper>
            )}

            {/* Help information */}
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Що робити далі?"
              color="blue"
              variant="light"
              w="100%">
              <Stack gap="xs">
                <Text size="sm">• Перевірте правильність заповнення всіх полів</Text>
                <Text size="sm">• Переконайтеся, що товари є в наявності</Text>
                <Text size="sm">• Спробуйте оновити сторінку та повторити</Text>
                <Text size="sm">• Зверніться до служби підтримки при повторних помилках</Text>
              </Stack>
            </Alert>

            {/* Action buttons */}
            <Link href="/cart">
              <Button variant="primary" flex={1} className={styles.bth}>
                Повернутись до кошика
              </Button>
            </Link>
            <Link href="/checkout">
              <Button variant="outline" flex={1} className={styles.bth}>Спробувати знову</Button>
            </Link>

            {/* Contact support */}
            <Text ta="center" size="sm" c="dimmed">
              Потрібна допомога? Зверніться до{' '}
              <Link href="/contact">
                <Text c="blue" td="underline">
                  служби підтримки
                </Text>
              </Link>
            </Text>
          </Stack>
        </Paper>
      </Container></div>
  );
};

export default CheckoutFailedPage;

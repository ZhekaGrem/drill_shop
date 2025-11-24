// src/app/payment/failed/[orderId]/PaymentFailed.tsx - FIXED
'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Title, Text, Button, Group, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { usePaymentStatus } from '@/features/payment/hooks/usePayment';

const PaymentFailedPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  // ✅ Отримуємо orderNumber з API
  const { data: paymentData } = usePaymentStatus(orderId, !!orderId);
  const trackingId = paymentData?.orderNumber || orderId;

  const getErrorMessage = (errorCode: string | null, reason: string | null) => {
    if (reason) return reason;

    switch (errorCode) {
      case 'PAYMENT_DECLINED':
        return 'Платіж відхилено банком. Перевірте дані карти або спробуйте іншу карту.';
      case 'INSUFFICIENT_FUNDS':
        return 'Недостатньо коштів на карті.';
      case 'CARD_EXPIRED':
        return 'Термін дії карти закінчився.';
      case 'INVALID_CARD':
        return 'Невірні дані карти.';
      case 'LIMIT_EXCEEDED':
        return 'Перевищено ліміт операцій.';
      case 'TIMEOUT':
        return 'Час очікування платежу вичерпано.';
      case 'CANCELLED_BY_USER':
        return 'Платіж скасовано користувачем.';
      case 'TECHNICAL_ERROR':
        return 'Технічна помилка платіжної системи.';
      default:
        return 'Не вдалося обробити платіж. Спробуйте ще раз або виберіть інший спосіб оплати.';
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <IconAlertTriangle size={80} color="var(--mantine-color-red-6)" />

          <Title order={2} ta="center" c="red">
            Помилка оплати
          </Title>

          <Text ta="center" size="lg">
            {getErrorMessage(error, reason)}
          </Text>

          <Text ta="center" c="dimmed">
            Ваше замовлення збережено, але оплата не пройшла. Спробуйте оплатити ще раз або оберіть інший
            спосіб оплати.
          </Text>

          {/* Деталі помилки */}
          {(trackingId || error) && (
            <Paper p="md" withBorder radius="md" w="100%" bg="red.0">
              {trackingId && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Номер замовлення:
                  </Text>
                  <Text size="sm" ff="monospace">
                    {trackingId}
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

          {/* Рекомендації */}
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Що робити далі?"
            color="blue"
            variant="light"
            w="100%">
            <Stack gap="xs">
              <Text size="sm">• Перевірте дані карти та спробуйте ще раз</Text>
              <Text size="sm">• Переконайтеся, що на карті достатньо коштів</Text>
              <Text size="sm">• Спробуйте використати іншу карту</Text>
              <Text size="sm">• Оберіть інший спосіб оплати (готівка при отриманні)</Text>
              <Text size="sm">• Зверніться до банку, що випустив карту</Text>
            </Stack>
          </Alert>

          {/* Кнопки дій */}
          <Group w="100%">
            {trackingId && (
              <Button component={Link} href={`/orders/track/${trackingId}`} variant="light" flex={1}>
                Переглянути замовлення
              </Button>
            )}

            <Button component={Link} href="/checkout" flex={1}>
              Спробувати знову
            </Button>
          </Group>

          {/* Підтримка */}
          <Text ta="center" size="sm" c="dimmed">
            Потрібна допомога? Зверніться до{' '}
            <Text component={Link} href="/contact" c="blue" td="underline">
              служби підтримки
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentFailedPage;

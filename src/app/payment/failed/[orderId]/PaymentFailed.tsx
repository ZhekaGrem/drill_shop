// src/app/payment/failed/[orderId]/PaymentFailed.tsx - FIXED
'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Title, Text, Group, Stack, Alert, Image } from '@mantine/core';
import { usePaymentStatus } from '@/features/payment/hooks/usePayment';
import { Button } from '@/shared/components/Button/Button'

import styles from './paymentFailed.module.scss';

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
    <div className={styles.paymentFailedPage}>
      <Container size="sm" py="xl">
        <Paper className={styles.wrapper}>
          <Stack align="center" gap="lg">
            <Image src="/assets/img/rage.png" alt="Hero" height={200} fit="contain" radius="md" className={styles.image} />

            <Title order={1} ta="center" c="red">
              Не вдалося провести оплату!
            </Title>

            <Text ta="center" size="lg">
              {getErrorMessage(error, reason)}
            </Text>



            {/* Деталі помилки */}
            {(trackingId || error) && (
              <>
                {trackingId && (
                  <Group justify="center">
                    <Text size="xl" c="dimmed">
                      Номер замовлення:
                    </Text>
                    <Text size="xl" ff="monospace">
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
                )}</>
            )}

            {/* Рекомендації */}
            {/* <Alert
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
            </Alert> */}

            {/* Кнопки дій */}

            {trackingId && (
              <Link href={`/orders/track/${trackingId}`} className={styles.bth}>
                <Button variant="primary" flex={1}>
                  Переглянути замовлення
                </Button></Link>
            )}
            <Link href="/checkout">
              <Button variant="outline" flex={1} className={styles.bth}>
                Спробувати знову
              </Button></Link>

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
    </div>
  );
};

export default PaymentFailedPage;

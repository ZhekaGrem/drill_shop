// src/app/payment/success/[orderId]/PaymentSuccess.tsx - FIXED
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Paper, Title, Text, Button, Group, Stack, Loader, Alert } from '@mantine/core';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { usePaymentStatus } from '@/features/payment/hooks/usePayment';
import styles from './payment-success.module.scss';

const PaymentSuccessPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.orderId as string;
  const [isVerifying, setIsVerifying] = useState(true);

  // ✅ FIXED: Використовуємо orderId замість paymentId
  const { data: paymentData, isLoading, error } = usePaymentStatus(orderId, !!orderId);

  useEffect(() => {
    if (paymentData && !isLoading) {
      setIsVerifying(false);

      // Redirect to order tracking after 3 seconds
      const timeout = setTimeout(() => {
        // ✅ Використовуємо orderNumber якщо є, інакше orderId
        const trackingId = paymentData.orderNumber || orderId;
        if (trackingId) {
          router.push(`/orders/track/${trackingId}`);
        } else {
          router.push('/');
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [paymentData, isLoading, orderId, router]);

  if (!orderId) {
    return (
      <div className={styles.paymentSuccessPage}>
        <Container size="sm" py="xl">
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
            Невірний ідентифікатор замовлення
          </Alert>
        </Container>
      </div>
    );
  }

  if (isLoading || isVerifying) {
    return (
      <div className={styles.paymentSuccessPage}>
        <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <Loader size="lg" />
            <Title order={3} ta="center">
              Перевіряємо статус оплати...
            </Title>
            <Text c="dimmed" ta="center">
              Будь ласка, зачекайте, поки ми підтвердимо ваш платіж
            </Text>
          </Stack>
        </Paper>
      </Container>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className={styles.paymentSuccessPage}>
        <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <IconAlertCircle size={80} color="var(--mantine-color-red-6)" />
            <Title order={2} ta="center">
              Помилка перевірки платежу
            </Title>
            <Text c="dimmed" ta="center">
              Не вдалося перевірити статус вашого платежу. Зверніться до служби підтримки.
            </Text>
            <Group>
              <Button component={Link} href="/" variant="light">
                На головну
              </Button>
              <Button onClick={() => window.location.reload()}>Спробувати знову</Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
      </div>
    );
  }

  // ✅ Тепер paymentData гарантовано існує
  const isSuccess = paymentData.status === 'PAID';
  const isPending = paymentData.status === 'PENDING';
  const isFailed = paymentData.status === 'FAILED';

  return (
    <div className={styles.paymentSuccessPage}>
      <Container size="sm" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          {isSuccess && (
            <>
              <IconCircleCheck size={80} color="var(--mantine-color-green-6)" />
              <Title order={2} ta="center" c="green">
                Оплата успішна!
              </Title>
              <Text ta="center">Ваш платіж успішно обробленο.</Text>
              <Text ta="center" c="dimmed">
                Ми надіслали підтвердження на вашу електронну пошту. Через кілька секунд ви будете
                перенаправлені на сторінку замовлення.
              </Text>
            </>
          )}

          {isPending && (
            <>
              <Loader size="lg" />
              <Title order={3} ta="center" c="blue">
                Обробка платежу...
              </Title>
              <Text ta="center" c="dimmed">
                Ваш платіж ще обробляється. Будь ласка, зачекайте.
              </Text>
            </>
          )}

          {isFailed && (
            <>
              <IconAlertCircle size={80} color="var(--mantine-color-red-6)" />
              <Title order={2} ta="center" c="red">
                Оплата не вдалася
              </Title>
              <Text ta="center" c="dimmed">
                На жаль, ваш платіж не було обробленο. Спробуйте ще раз або виберіть інший спосіб оплати.
              </Text>
            </>
          )}

          <Paper p="md" withBorder radius="md" w="100%">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Номер замовлення:
              </Text>
              <Text size="sm" ff="monospace">
                {paymentData?.orderNumber || orderId}
              </Text>
            </Group>
          </Paper>

          <Group w="100%">
            <Button component={Link} href="/" variant="light" flex={1}>
              На головну
            </Button>

            {(paymentData?.orderNumber || orderId) && isSuccess && (
              <Button component={Link} href={`/orders/track/${paymentData?.orderNumber || orderId}`} flex={1}>
                Переглянути замовлення
              </Button>
            )}

            {!isSuccess && (
              <Button component={Link} href="/checkout" flex={1}>
                Спробувати знову
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    </Container>
    </div>
  );
};

export default PaymentSuccessPage;

// src/features/admin/components/OrderEdit/sections/CustomerInfoSection.tsx
import React, { useState } from 'react';
import { Card, Grid, TextInput, Title, Group, Select, Button, Stack } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { UseFormReturn } from 'react-hook-form';
import { Order, PaymentStatus } from '@/shared/types/generated.types';
import { apiClient } from '@/shared/api/client';

interface CustomerInfoSectionProps {
  form: UseFormReturn<any>;
  order: Order;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;
  onPaymentStatusUpdated: (newStatus: PaymentStatus) => void;
}

/**
 * Секція інформації про клієнта
 * Включає поля клієнта та контроль статусу оплати
 */
export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  form,
  order,
  paymentStatus,
  setPaymentStatus,
  onPaymentStatusUpdated,
}) => {
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  // Оновлення статусу оплати
  const handlePaymentStatusUpdate = async () => {
    if (paymentStatus === order.paymentStatus) return;

    setIsUpdatingPaymentStatus(true);
    try {
      await apiClient.patch(`/admin/orders/${order.id}/status`, {
        paymentStatus,
        comment: `Статус оплати змінено з ${order.paymentStatus} на ${paymentStatus}`,
        notifyCustomer: false,
      });

      onPaymentStatusUpdated(paymentStatus);
      alert('Статус оплати успішно оновлено');
    } catch (error: any) {
      console.error('❌ Failed to update payment status:', error);
      alert('Помилка при оновленні статусу оплати');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Group mb="lg">
        <IconEdit size={20} />
        <Title order={3}>Інформація про клієнта</Title>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Ім'я"
            required
            {...form.register('guestFirstName')}
            error={form.formState.errors.guestFirstName?.message as string | undefined}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Прізвище"
            required
            {...form.register('guestLastName')}
            error={form.formState.errors.guestLastName?.message as string | undefined}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Email"
            type="email"
            {...form.register('guestEmail')}
            error={form.formState.errors.guestEmail?.message as string | undefined}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput label="Телефон" {...form.register('shippingAddress.phone')} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <Select
              label="Статус оплати"
              description="Змініть статус оплати замовлення"
              data={[
                { value: PaymentStatus.PENDING, label: 'Очікує оплати' },
                { value: PaymentStatus.PAID, label: 'Оплачено' },
                { value: PaymentStatus.FAILED, label: 'Помилка оплати' },
                { value: PaymentStatus.PARTIALLY_PAID, label: 'Частково оплачено' },
                { value: PaymentStatus.REFUNDED, label: 'Повернуто' },
              ]}
              value={paymentStatus}
              onChange={(value) => setPaymentStatus(value as PaymentStatus)}
            />
            <Button
              size="xs"
              variant="light"
              loading={isUpdatingPaymentStatus}
              disabled={paymentStatus === order.paymentStatus}
              onClick={handlePaymentStatusUpdate}>
              Оновити статус оплати
            </Button>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

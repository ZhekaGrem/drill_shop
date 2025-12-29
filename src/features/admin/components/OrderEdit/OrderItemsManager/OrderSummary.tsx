// src/features/admin/components/OrderEdit/OrderItemsManager/OrderSummary.tsx
import React from 'react';
import { Paper, Stack, Group, Text, Divider } from '@mantine/core';
import { formatPrice } from '@/shared/utils/format';

interface OrderSummaryProps {
  subtotal: number;
  totalAmount: number;
}

/**
 * Компонент відображення підсумків замовлення
 * Показує subtotal та загальну суму
 */
export const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal, totalAmount }) => {
  return (
    <>
      <Divider my="lg" />
      <Paper withBorder p="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="lg" fw={500}>
              Підсумок:
            </Text>
            <Text size="lg" fw={500}>
              {formatPrice(subtotal)}
            </Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Всього:
            </Text>
            <Text size="xl" fw={700} c="blue">
              {formatPrice(totalAmount)}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </>
  );
};

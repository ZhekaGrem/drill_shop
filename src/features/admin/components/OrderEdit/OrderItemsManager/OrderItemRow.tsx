// src/features/admin/components/OrderEdit/OrderItemsManager/OrderItemRow.tsx
import React from 'react';
import { Paper, Group, Box, Text, NumberInput, ActionIcon, Badge } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { OrderItem } from '@/shared/types/generated.types';
import { formatPrice } from '@/shared/utils/format';

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
}

interface OrderItemRowProps {
  item: OrderItemEdit;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void;
  onRemove: (itemId: string) => void;
}

/**
 * Компонент відображення одного товару замовлення
 * Дозволяє змінювати кількість, ціну та видаляти товар
 */
export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}) => {
  const productInfo = item.productSnapshot;
  const productName = productInfo?.name || 'Невідомий товар';
  const productSku = productInfo?.sku || 'N/A';

  return (
    <Paper
      withBorder
      p="md"
      style={{
        opacity: item.isRemoved ? 0.5 : 1,
        backgroundColor: item.isRemoved ? 'var(--mantine-color-red-0)' : undefined,
      }}>
      <Group justify="space-between" align="flex-start">
        <Box style={{ flex: 1 }}>
          <Text fw={500}>{productName}</Text>

          <Text size="sm" c="dimmed">
            SKU: {productSku}
          </Text>
          {item.isRemoved && (
            <Badge color="red" variant="light" size="sm" mt="xs">
              Видалено
            </Badge>
          )}
          {item.isModified && !item.isRemoved && (
            <Badge color="blue" variant="light" size="sm" mt="xs">
              Змінено
            </Badge>
          )}
        </Box>

        <Group gap="md" align="flex-end">
          <NumberInput
            label="Кількість"
            value={item.newQuantity ?? item.quantity}
            onChange={(value) => onUpdateQuantity(item.id, Number(value) || 0)}
            disabled={item.isRemoved}
            min={1}
            w={80}
          />

          <NumberInput
            label="Ціна"
            value={item.newUnitPrice ?? Number(item.unitPrice)}
            onChange={(value) => onUpdatePrice(item.id, Number(value) || 0)}
            disabled={item.isRemoved}
            min={0.01}
            step={0.01}
            w={100}
          />

          <Box>
            <Text size="xs" c="dimmed">
              Загалом
            </Text>
            <Text fw={500}>
              {formatPrice((item.newQuantity ?? item.quantity) * Number(item.newUnitPrice ?? item.unitPrice))}
            </Text>
          </Box>

          {!item.isRemoved && (
            <ActionIcon color="red" variant="light" onClick={() => onRemove(item.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Paper>
  );
};

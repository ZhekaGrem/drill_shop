// src/features/admin/components/OrderEdit/OrderItemsManager/OrderItemsManager.tsx
import React from 'react';
import { Card, Stack, Title, Group } from '@mantine/core';
import { OrderItem, Product, Order } from '@/shared/types/generated.types';
import { OrderItemRow } from './OrderItemRow';
import { NewItemForm } from './NewItemForm';
import { OrderSummary } from './OrderSummary';

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
  product?: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface NewOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  product: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface OrderItemsManagerProps {
  items: OrderItemEdit[];
  newItems: NewOrderItem[];
  availableProducts: Product[];
  order: Order | null;
  totals: {
    subtotal: number;
    totalAmount: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdatePrice: (itemId: string, price: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddProduct: (
    selectedProductId: string,
    selectedVariantId: string,
    availableProducts: Product[],
    onSuccess: () => void
  ) => void;
  setNewItems: React.Dispatch<React.SetStateAction<NewOrderItem[]>>;
}

/**
 * Менеджер товарів замовлення
 * Відповідає за відображення та управління товарами
 */
export const OrderItemsManager: React.FC<OrderItemsManagerProps> = ({
  items,
  newItems,
  availableProducts,
  order,
  totals,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  onAddProduct,
  setNewItems,
}) => {
  const handleUpdateNewItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    setNewItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Group justify="space-between" mb="lg">
        <Title order={3}>Товари замовлення</Title>
        <NewItemForm
          availableProducts={availableProducts}
          newItems={newItems}
          onAddProduct={onAddProduct}
          onUpdateNewItem={handleUpdateNewItem}
          onRemoveNewItem={handleRemoveNewItem}
        />
      </Group>

      <Stack gap="md">
        {items.map((item) => (
          <OrderItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePrice={onUpdatePrice}
            onRemove={onRemoveItem}
          />
        ))}
      </Stack>

      <OrderSummary subtotal={totals.subtotal} totalAmount={totals.totalAmount} />
    </Card>
  );
};

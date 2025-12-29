// src/features/admin/components/OrderEdit/OrderItemsManager/NewItemForm.tsx
import React, { useState } from 'react';
import {
  Card,
  Stack,
  Text,
  Select,
  Group,
  Button,
  Paper,
  Box,
  NumberInput,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Product } from '@/shared/types/generated.types';
import { formatPrice } from '@/shared/utils/format';

interface NewOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  product: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface NewItemFormProps {
  availableProducts: Product[];
  newItems: NewOrderItem[];
  onAddProduct: (
    selectedProductId: string,
    selectedVariantId: string,
    availableProducts: Product[],
    onSuccess: () => void
  ) => void;
  onUpdateNewItem: (index: number, field: 'quantity' | 'unitPrice', value: number) => void;
  onRemoveNewItem: (index: number) => void;
}

/**
 * Форма для додавання нових товарів до замовлення
 * Включає вибір товару, варіанту та відображення доданих товарів
 */
export const NewItemForm: React.FC<NewItemFormProps> = ({
  availableProducts,
  newItems,
  onAddProduct,
  onUpdateNewItem,
  onRemoveNewItem,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const handleAdd = () => {
    onAddProduct(selectedProductId, selectedVariantId, availableProducts, () => {
      setSelectedProductId('');
      setSelectedVariantId('');
    });
  };

  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId);
  const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;

  return (
    <Card padding="sm" withBorder mb="md" style={{ backgroundColor: '#f8f9fa', minWidth: '300px' }}>
      <Stack gap="sm">
        <Text size="sm" fw={500}>
          Додати товар до замовлення
        </Text>

        <Select
          label="Товар"
          placeholder="Оберіть товар зі списку"
          data={availableProducts.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.sku}) - ${formatPrice(Number(p.price))}${p.variants && p.variants.length > 0 ? ` • ${p.variants.length} варіантів` : ''}`,
          }))}
          value={selectedProductId}
          onChange={(value) => {
            setSelectedProductId(value || '');
            setSelectedVariantId('');
          }}
          searchable
          comboboxProps={{ zIndex: 1001 }}
        />

        {selectedProductId && hasVariants && (
          <Select
            label="Варіант товару (опціонально)"
            placeholder="Оберіть варіант або залиште основний товар"
            data={[
              { value: '', label: '--- Основний товар ---' },
              ...(selectedProduct.variants?.map((v) => ({
                value: v.id,
                label: `${v.name || v.sku} - ${formatPrice(Number(v.price))}${v.unitValue ? ` (${v.unitValue} ${selectedProduct.unit || ''})` : ''}`,
              })) || []),
            ]}
            value={selectedVariantId}
            onChange={(value) => setSelectedVariantId(value || '')}
            clearable
            comboboxProps={{ zIndex: 1001 }}
          />
        )}

        <Group justify="flex-end">
          <Button leftSection={<IconPlus size={16} />} onClick={handleAdd} disabled={!selectedProductId}>
            Додати товар
          </Button>
        </Group>

        {/* Відображення нових товарів */}
        {newItems.length > 0 && (
          <Stack gap="sm" mt="md">
            {newItems.map((item, index) => (
              <Paper
                key={`new-${index}`}
                withBorder
                p="md"
                style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text fw={500}>{item.product.name}</Text>
                    <Text size="sm" c="dimmed">
                      SKU: {item.product.sku}
                    </Text>
                    <Badge color="green" variant="light" size="sm" mt="xs">
                      НОВИЙ
                    </Badge>
                  </Box>

                  <Group gap="md" align="flex-end">
                    <NumberInput
                      label="Кількість"
                      value={item.quantity}
                      onChange={(value) => onUpdateNewItem(index, 'quantity', Number(value) || 0)}
                      min={1}
                      w={80}
                    />

                    <NumberInput
                      label="Ціна"
                      value={item.unitPrice}
                      onChange={(value) => onUpdateNewItem(index, 'unitPrice', Number(value) || 0)}
                      min={0.01}
                      step={0.01}
                      w={100}
                    />

                    <Box>
                      <Text size="xs" c="dimmed">
                        Загалом
                      </Text>
                      <Text fw={500}>{formatPrice(item.quantity * item.unitPrice)}</Text>
                    </Box>

                    <ActionIcon color="red" variant="light" onClick={() => onRemoveNewItem(index)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

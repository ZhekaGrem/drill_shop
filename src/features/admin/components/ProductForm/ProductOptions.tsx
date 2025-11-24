// src/features/admin/components/ProductForm/ProductOptions.tsx - НОВИЙ ФАЙЛ
'use client';

import { Card, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';
import { ProductVariantOptions } from './ProductVariantOptions';

interface ProductOptionsProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductOptions = ({ form }: ProductOptionsProps) => {
  const handleOptionsChange = (newOptions: Record<string, any>) => {
    form.setFieldValue('options', newOptions);
  };

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Характеристики товару для основного товару(опціонально)
      </Text>

      <Text size="sm" c="dimmed" mb="md">
        Додайте характеристики для основного товару (колір, розмір, смак тощо). Якщо у вас є варіанти -
        характеристики можна додати окремо для кожного варіанту.
      </Text>

      <ProductVariantOptions options={form.values.options || {}} onChange={handleOptionsChange} />

      {form.values.options && Object.keys(form.values.options).length > 0 && (
        <Text size="xs" c="dimmed" mt="md" style={{ fontStyle: 'italic' }}>
          💡 Збережено {Object.keys(form.values.options).length} характеристик(и)
        </Text>
      )}
    </Card>
  );
};

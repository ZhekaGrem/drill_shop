// src/features/admin/components/DiscountForm/components/DiscountPreview.tsx
'use client';

import { Text } from '@mantine/core';
import { DiscountType } from '@/shared/types/generated.types';
import { DiscountFormData } from '@/shared/types/admin.types';

interface DiscountPreviewProps {
  values: DiscountFormData;
}

export const DiscountPreview = ({ values }: DiscountPreviewProps) => {
  if (!values.name) return null;

  return (
    <>
      <Text size="sm" mb="xs">
        <strong>Назва:</strong> {values.name}
      </Text>

      {values.code && (
        <Text size="sm" mb="xs">
          <strong>Промокод:</strong> {values.code}
        </Text>
      )}

      <Text size="sm" mb="xs">
        <strong>Знижка:</strong> {values.value}
        {values.type === DiscountType.PERCENTAGE ? '%' : ' грн'}
      </Text>

      {values.minOrderAmount && (
        <Text size="sm" mb="xs">
          <strong>Мінімальна сума:</strong> {values.minOrderAmount} грн
        </Text>
      )}

      {values.maxDiscount && values.type === DiscountType.PERCENTAGE && (
        <Text size="sm" mb="xs">
          <strong>Максимальна знижка:</strong> {values.maxDiscount} грн
        </Text>
      )}
    </>
  );
};

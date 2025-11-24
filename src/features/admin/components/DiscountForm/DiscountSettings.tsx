// src/features/admin/components/DiscountForm/components/DiscountSettings.tsx
'use client';

import { Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { DiscountFormData } from '@/shared/types/admin.types';

interface DiscountSettingsProps {
  form: UseFormReturnType<DiscountFormData>;
}

export const DiscountSettings = ({ form }: DiscountSettingsProps) => {
  return (
    <Switch
      label="Активна знижка"
      description="Знижка буде доступна для використання"
      {...form.getInputProps('isActive', { type: 'checkbox' })}
    />
  );
};

// src/features/admin/components/DiscountForm/DiscountForm.tsx
'use client';

import { Button, Group, Stack, Text, Card } from '@mantine/core';
import { DiscountFormProps } from '@/shared/types/admin.types';
import { useDiscountForm } from '../../hooks/useDiscountForm';
import { DiscountBasicInfo } from './DiscountBasicInfo';
import { DiscountTimeConstraints } from './DiscountTimeConstraints';
import { DiscountSettings } from './DiscountSettings';
import { DiscountPreview } from './DiscountPreview';
import { DiscountValidationErrors } from './DiscountValidationErrors';

export const DiscountForm = ({ discount, onSubmit, onCancel, isLoading }: DiscountFormProps) => {
  const { form } = useDiscountForm({ discount });

  // Clean submit handler
  const handleSubmit = async (values: any) => {
    try {
      const cleanedData = {
        name: values.name.trim(),
        code: values.code?.trim().toUpperCase() || undefined,
        type: values.type,
        value: Number(values.value),
        minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : undefined,
        maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : undefined,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
        startsAt: values.startsAt instanceof Date ? values.startsAt.toISOString() : undefined,
        endsAt: values.endsAt instanceof Date ? values.endsAt.toISOString() : undefined,
        isActive: values.isActive,
        applicableProductIds:
          values.applicableProductIds.length > 0 ? values.applicableProductIds : undefined,
      };

      // Remove undefined values
      Object.keys(cleanedData).forEach((key) => {
        const value = (cleanedData as any)[key];
        if (value === undefined || value === '') {
          delete (cleanedData as any)[key];
        }
      });

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        {/* Basic Information */}
        <Card padding="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Основна інформація
          </Text>
          <DiscountBasicInfo form={form} />
        </Card>

        {/* Time Constraints */}
        <Card padding="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Часові обмеження
          </Text>
          <DiscountTimeConstraints form={form} />
        </Card>

        {/* Settings */}
        <Card padding="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Налаштування
          </Text>
          <DiscountSettings form={form} />
        </Card>

        {/* Preview */}
        <Card padding="md" withBorder style={{ background: '#f8f9fa' }}>
          <Text size="lg" fw={600} mb="md">
            Попередній перегляд
          </Text>
          <DiscountPreview values={form.values} />
        </Card>

        {/* Validation Errors */}
        <DiscountValidationErrors errors={form.errors} />

        {/* Actions */}
        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Скасувати
          </Button>
          <Button type="submit" style={{ background: 'var(--btn-primary)' }}>
            {discount ? 'Оновити знижку' : 'Створити знижку'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

// src/features/admin/components/OrderEdit/sections/OrderNotesSection.tsx
import React from 'react';
import { Card, Stack, Textarea, Title } from '@mantine/core';
import { UseFormReturn } from 'react-hook-form';

interface OrderNotesSectionProps {
  form: UseFormReturn<any>;
}

/**
 * Секція приміток до замовлення
 * Включає примітки клієнта та внутрішні примітки
 */
export const OrderNotesSection: React.FC<OrderNotesSectionProps> = ({ form }) => {
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Title order={3} mb="lg">
        Примітки
      </Title>

      <Stack gap="md">
        <Textarea label="Примітки клієнта" rows={3} {...form.register('notes')} />

        <Textarea label="Внутрішні примітки" rows={3} {...form.register('internalNotes')} />
      </Stack>
    </Card>
  );
};

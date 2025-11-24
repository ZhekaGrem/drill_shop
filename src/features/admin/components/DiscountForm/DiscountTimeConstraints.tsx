// src/features/admin/components/DiscountForm/components/DiscountTimeConstraints.tsx
'use client';

import { Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { DiscountFormData } from '@/shared/types/admin.types';

interface DiscountTimeConstraintsProps {
  form: UseFormReturnType<DiscountFormData>;
}

export const DiscountTimeConstraints = ({ form }: DiscountTimeConstraintsProps) => {
  const now = new Date();
  const startsAt = form.values.startsAt;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <DateTimePicker
          label="Дата початку"
          placeholder="Оберіть дату та час"
          valueFormat="DD.MM.YYYY HH:mm"
          minDate={now}
          clearable
          {...form.getInputProps('startsAt')}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <DateTimePicker
          label="Дата закінчення"
          placeholder="Оберіть дату та час"
          valueFormat="DD.MM.YYYY HH:mm"
          minDate={startsAt || now}
          clearable
          {...form.getInputProps('endsAt')}
        />
      </Grid.Col>
    </Grid>
  );
};

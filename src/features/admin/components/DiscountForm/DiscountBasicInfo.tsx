'use client';

import { Grid, TextInput, Select, NumberInput } from '@mantine/core';
import { IconPercentage, IconCurrencyHryvnia } from '@tabler/icons-react';
import { DiscountType } from '@/shared/types/generated.types';
import { UseFormReturnType } from '@mantine/form';
import { DiscountFormData } from '@/shared/types/admin.types';

interface DiscountBasicInfoProps {
  form: UseFormReturnType<DiscountFormData>;
}

const DISCOUNT_TYPE_OPTIONS = [
  {
    value: DiscountType.PERCENTAGE,
    label: 'Відсоткова знижка',
    icon: <IconPercentage size={16} />,
  },
  {
    value: DiscountType.FIXED_AMOUNT,
    label: 'Фіксована сума',
    icon: <IconCurrencyHryvnia size={16} />,
  },
];

export const DiscountBasicInfo = ({ form }: DiscountBasicInfoProps) => {
  return (
    <Grid>
      <Grid.Col span={12}>
        <TextInput
          label="Назва знижки"
          placeholder="Введіть назву знижки"
          required
          {...form.getInputProps('name')}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <TextInput
          label="Промокод"
          placeholder="SAVE20"
          description="Залиште порожнім для автоматичної знижки"
          {...form.getInputProps('code')}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Select
          label="Тип знижки"
          placeholder="Оберіть тип"
          data={DISCOUNT_TYPE_OPTIONS}
          value={form.values.type}
          onChange={(value) => form.setFieldValue('type', value as DiscountType)}
          required
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <NumberInput
          label={form.values.type === DiscountType.PERCENTAGE ? 'Відсоток знижки' : 'Сума знижки (грн)'}
          placeholder={form.values.type === DiscountType.PERCENTAGE ? '10' : '100'}
          min={0}
          max={form.values.type === DiscountType.PERCENTAGE ? 100 : 100000}
          required
          {...form.getInputProps('value')}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <NumberInput
          label="Мінімальна сума замовлення (грн)"
          placeholder="500"
          min={0}
          {...form.getInputProps('minOrderAmount')}
        />
      </Grid.Col>

      {form.values.type === DiscountType.PERCENTAGE && (
        <Grid.Col span={{ base: 12, md: 6 }}>
          <NumberInput
            label="Максимальна знижка (грн)"
            placeholder="1000"
            min={0}
            {...form.getInputProps('maxDiscount')}
          />
        </Grid.Col>
      )}

      <Grid.Col span={{ base: 12, md: 6 }}>
        <NumberInput
          label="Ліміт використання"
          placeholder="100"
          min={1}
          description="Залиште порожнім для необмеженого використання"
          {...form.getInputProps('usageLimit')}
        />
      </Grid.Col>
    </Grid>
  );
};

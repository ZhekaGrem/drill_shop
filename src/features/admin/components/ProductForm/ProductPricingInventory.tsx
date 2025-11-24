// src/features/admin/components/ProductForm/ProductPricingInventory.tsx
import { Grid, NumberInput, Select, Card, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';

interface ProductPricingInventoryProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductPricingInventory = ({ form }: ProductPricingInventoryProps) => {
  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Ціна та склад
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Ціна"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            required
            {...form.getInputProps('price')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Собівартість"
            placeholder="0.00"
            min={0}
            decimalScale={2}
            {...form.getInputProps('costPrice')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Кількість на складі"
            placeholder="0"
            min={0}
            {...form.getInputProps('quantity')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Кількість одиниці товару"
            placeholder="0.0"
            min={0}
            decimalScale={3}
            step={0.1}
            {...form.getInputProps('unitValue')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Одиниця виміру"
            placeholder="Оберіть одиницю"
            value={form.values.unit}
            onChange={(value) => form.setFieldValue('unit', value || 'PIECE')}
            data={[
              { value: 'PIECE', label: 'Штука' },
              { value: 'KG', label: 'Кілограм' },
              { value: 'GRAM', label: 'Грам' },
              { value: 'LITER', label: 'Літр' },
              { value: 'ML', label: 'Мілілітр' },
            ]}
            comboboxProps={{ zIndex: 1001 }}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
};

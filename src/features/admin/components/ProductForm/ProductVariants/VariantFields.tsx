import { Grid, Text, TextInput, NumberInput } from '@mantine/core';

interface VariantFieldsProps {
  variant: {
    sku: string;
    name: string;
    price: number;
    quantity: number;
    unitValue?: number;
  };
  onUpdate: (field: string, value: any) => void;
  skuError?: string | null;
}

export const VariantFields = ({ variant, onUpdate, skuError }: VariantFieldsProps) => {
  return (
    <Grid>
      <Grid.Col span={3}>
        <Text size="xs" c="dimmed">
          Артикул
        </Text>
        <TextInput
          value={variant.sku}
          onChange={(e) => onUpdate('sku', e.target.value)}
          size="xs"
          error={skuError}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <Text size="xs" c="dimmed">
          Назва
        </Text>
        <TextInput value={variant.name || ''} onChange={(e) => onUpdate('name', e.target.value)} size="xs" />
      </Grid.Col>
      <Grid.Col span={2}>
        <Text size="xs" c="dimmed">
          Ціна
        </Text>
        <NumberInput value={variant.price} onChange={(val) => onUpdate('price', val || 0)} min={0.01} size="xs" />
      </Grid.Col>
      <Grid.Col span={2}>
        <Text size="xs" c="dimmed">
          Кількість на складі
        </Text>
        <NumberInput value={variant.quantity} onChange={(val) => onUpdate('quantity', val || 0)} min={0} size="xs" />
      </Grid.Col>
      <Grid.Col span={2}>
        <Text size="xs" c="dimmed">
          Кількість одиниці товару
        </Text>
        <NumberInput
          value={variant.unitValue || 0}
          onChange={(val) => onUpdate('unitValue', val || 0)}
          min={0}
          decimalScale={3}
          size="xs"
        />
      </Grid.Col>
    </Grid>
  );
};

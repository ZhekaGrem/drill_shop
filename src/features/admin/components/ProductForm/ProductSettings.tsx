// src/features/admin/components/ProductForm/ProductSettings.tsx
import { Stack, Switch, Card, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';

interface ProductSettingsProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductSettings = ({ form }: ProductSettingsProps) => {
  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Налаштування
      </Text>

      <Stack gap="sm">
        <Switch
          label="Активний товар"
          description="Товар буде відображатися у каталозі"
          {...form.getInputProps('isActive', { type: 'checkbox' })}
        />
        <Switch
          label="Рекомендований товар"
          description="Товар буде відображатися у розділі рекомендованих"
          {...form.getInputProps('isFeatured', { type: 'checkbox' })}
        />
      </Stack>
    </Card>
  );
};

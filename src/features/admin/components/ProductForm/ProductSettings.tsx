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
          checked={form.values.isActive}
          onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
        />
        <Switch
          label="Рекомендований товар"
          description="Товар буде відображатися у розділі рекомендованих"
          checked={form.values.isFeatured}
          onChange={(event) => form.setFieldValue('isFeatured', event.currentTarget.checked)}
        />
        <Switch
          label="Товар-контейнер для варіантів"
          description="Головний товар не можна буде купити окремо, тільки через вибір варіанту"
          checked={form.values.hasVariants}
          onChange={(event) => form.setFieldValue('hasVariants', event.currentTarget.checked)}
        />
      </Stack>
    </Card>
  );
};

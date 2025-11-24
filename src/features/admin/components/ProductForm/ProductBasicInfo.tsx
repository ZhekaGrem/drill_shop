// src/features/admin/components/ProductForm/ProductBasicInfo.tsx
import { Grid, TextInput, Textarea, Card, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';

interface ProductBasicInfoProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductBasicInfo = ({ form }: ProductBasicInfoProps) => {
  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Основна інформація
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Артикул"
            placeholder="Унікальний url-friendly-name"
            required
            {...form.getInputProps('sku')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Назва товару"
            placeholder="Введіть назву товару"
            required
            {...form.getInputProps('name')}
          />
        </Grid.Col>

        {/* <Grid.Col span={12}>
          <TextInput
            label="Slug (URL)"
            placeholder="url-friendly-name"
            {...form.getInputProps('slug')}
          />
        </Grid.Col> */}

        <Grid.Col span={12}>
          <Textarea
            label="Короткий опис"
            placeholder="Короткий опис товару для картки"
            rows={3}
            {...form.getInputProps('shortDescription')}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Повний опис"
            placeholder="Детальний опис товару"
            rows={5}
            {...form.getInputProps('description')}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
};

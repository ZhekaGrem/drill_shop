// src/features/admin/components/ProductForm/ProductCategorySelector.tsx
import { useEffect } from 'react';
import { MultiSelect, Card, Text, Alert, Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';
import { useCategoriesStore } from '@/shared/stores/categories';
import { IconAlertCircle } from '@tabler/icons-react';

interface ProductCategorySelectorProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductCategorySelector = ({ form }: ProductCategorySelectorProps) => {
  const {
    fetchCategories,
    isLoading: categoriesLoading,
    isInitialized: categoriesInitialized,
    error: categoriesError,
    flattenCategories,
  } = useCategoriesStore();

  // Initialize categories
  useEffect(() => {
    if (!categoriesInitialized && !categoriesLoading) {
      fetchCategories();
    }
  }, [categoriesInitialized, categoriesLoading, fetchCategories]);

  // Prepare category options
  const categoryOptions = (() => {
    if (!categoriesInitialized || categoriesLoading || !flattenCategories) {
      return [];
    }

    try {
      const flattened = flattenCategories();
      if (!Array.isArray(flattened)) return [];

      const options = flattened.map((cat) => ({
        value: cat.id,
        label: '  '.repeat(cat.depth || 0) + cat.name,
      }));

      return options;
    } catch (error) {
      console.error('Error building category options:', error);
      return [];
    }
  })();

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Категорії
      </Text>

      {categoriesLoading ? (
        <Text size="sm" c="dimmed">
          Завантаження категорій...
        </Text>
      ) : categoriesError ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          Помилка завантаження категорій: {categoriesError}
        </Alert>
      ) : !categoriesInitialized ? (
        <Text size="sm" c="dimmed">
          Ініціалізація категорій...
        </Text>
      ) : categoryOptions.length === 0 ? (
        <div>
          <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" mb="md">
            Категорії не знайдені. Спробуйте перезавантажити.
          </Alert>
          <Button size="xs" onClick={() => fetchCategories()} loading={categoriesLoading}>
            Перезавантажити категорії
          </Button>
        </div>
      ) : (
        <div>
          <Text size="xs" c="dimmed" mb="xs">
            Доступно {categoryOptions.length} категорій
          </Text>
          <MultiSelect
            comboboxProps={{ zIndex: 1001 }}
            label="Оберіть категорії"
            placeholder="Натисніть для вибору категорій..."
            data={categoryOptions}
            value={form.values.categoryIds || []}
            onChange={(value) => form.setFieldValue('categoryIds', value || [])}
            searchable
            required
            error={form.errors.categoryIds}
            clearable
          />
        </div>
      )}

      {form.values.categoryIds && form.values.categoryIds.length > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          Вибрано категорій: {form.values.categoryIds.length}
        </Text>
      )}
    </Card>
  );
};

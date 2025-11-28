// src/features/admin/components/ProductForm/ProductPromotion.tsx
import { Grid, Select, NumberInput, Card, Text, Alert } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';
import { ProductPromoType } from '@/shared/types/generated.types';

interface ProductPromotionProps {
  form: UseFormReturnType<ProductFormData>;
}

export const ProductPromotion = ({ form }: ProductPromotionProps) => {
  const handlePromoTypeChange = (value: string | null) => {
    form.setFieldValue('promoType', (value as ProductPromoType) || null);

    // Set proper initial promoConfig for each type
    if (value === ProductPromoType.BUY_X_GET_Y) {
      form.setFieldValue('promoConfig', { buyQuantity: 1, getQuantity: 1 });
    } else if (value === ProductPromoType.PERCENTAGE_OFF || value === ProductPromoType.TIME_LIMITED) {
      form.setFieldValue('promoConfig', { percentage: 10 });
    } else if (value === ProductPromoType.FIXED_DISCOUNT) {
      form.setFieldValue('promoConfig', { amount: 0 });
    } else if (value === ProductPromoType.BULK_DISCOUNT) {
      form.setFieldValue('promoConfig', { minQuantity: 2, discountPercentage: 10 });
    } else {
      form.setFieldValue('promoConfig', null);
      form.setFieldValue('promoEndsAt', null);
    }
  };

  const renderPromoFields = () => {
    if (!form.values.promoType) return null;

    switch (form.values.promoType) {
      case ProductPromoType.BUY_X_GET_Y:
        return (
          <>
            <Grid.Col span={6}>
              <NumberInput
                label="Кількість для покупки"
                placeholder="2"
                min={1}
                required
                value={form.values.promoConfig?.buyQuantity || 1}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    ...form.values.promoConfig,
                    buyQuantity: value || 1,
                    getQuantity: form.values.promoConfig?.getQuantity || 1,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Кількість безкоштовно"
                placeholder="1"
                min={1}
                required
                value={form.values.promoConfig?.getQuantity || 1}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    ...form.values.promoConfig,
                    buyQuantity: form.values.promoConfig?.buyQuantity || 1,
                    getQuantity: value || 1,
                  })
                }
              />
            </Grid.Col>
          </>
        );

      case ProductPromoType.PERCENTAGE_OFF:
      case ProductPromoType.TIME_LIMITED:
        return (
          <>
            <Grid.Col span={6}>
              <NumberInput
                label="Відсоток знижки"
                placeholder="20"
                min={1}
                max={90}
                required
                value={form.values.promoConfig?.percentage || 10}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    percentage: value || 10,
                    maxDiscount: form.values.promoConfig?.maxDiscount,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Максимальна знижка (грн)"
                placeholder="1000"
                min={0}
                value={form.values.promoConfig?.maxDiscount || 0}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    percentage: form.values.promoConfig?.percentage || 10,
                    maxDiscount: value || undefined,
                  })
                }
              />
            </Grid.Col>
          </>
        );

      case ProductPromoType.FIXED_DISCOUNT:
        return (
          <Grid.Col span={6}>
            <NumberInput
              label="Сума знижки (грн)"
              placeholder="100"
              min={0.01}
              required
              value={form.values.promoConfig?.amount || 0}
              onChange={(value) =>
                form.setFieldValue('promoConfig', {
                  amount: value || 0,
                })
              }
            />
          </Grid.Col>
        );

      case ProductPromoType.BULK_DISCOUNT:
        return (
          <>
            <Grid.Col span={6}>
              <NumberInput
                label="Мінімальна кількість"
                placeholder="5"
                min={2}
                required
                value={form.values.promoConfig?.minQuantity || 2}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    ...form.values.promoConfig,
                    minQuantity: value || 2,
                    discountPercentage: form.values.promoConfig?.discountPercentage || 10,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Відсоток знижки"
                placeholder="15"
                min={1}
                max={50}
                required
                value={form.values.promoConfig?.discountPercentage || 10}
                onChange={(value) =>
                  form.setFieldValue('promoConfig', {
                    ...form.values.promoConfig,
                    minQuantity: form.values.promoConfig?.minQuantity || 2,
                    discountPercentage: value || 10,
                  })
                }
              />
            </Grid.Col>
          </>
        );

      default:
        return null;
    }
  };

  const renderPromoPreview = () => {
    if (!form.values.promoType || !form.values.promoConfig) return null;

    let previewText = '';

    switch (form.values.promoType) {
      case ProductPromoType.BUY_X_GET_Y:
        previewText = `Купи ${form.values.promoConfig.buyQuantity} шт, отримай ${form.values.promoConfig.getQuantity} шт безкоштовно`;
        break;
      case ProductPromoType.PERCENTAGE_OFF:
      case ProductPromoType.TIME_LIMITED:
        previewText = `Знижка ${form.values.promoConfig.percentage}%`;
        if (form.values.promoConfig.maxDiscount) {
          previewText += ` (макс. ${form.values.promoConfig.maxDiscount} грн)`;
        }
        break;
      case ProductPromoType.FIXED_DISCOUNT:
        previewText = `Знижка ${form.values.promoConfig.amount} грн`;
        break;
      case ProductPromoType.BULK_DISCOUNT:
        previewText = `При покупці від ${form.values.promoConfig.minQuantity} шт - знижка ${form.values.promoConfig.discountPercentage}%`;
        break;
    }

    return (
      <Alert color="blue" variant="light" mt="md">
        <Text size="sm" fw={500} mb="xs">
          Попередній перегляд акції:
        </Text>
        <Text size="sm">{previewText}</Text>
      </Alert>
    );
  };

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Акції
      </Text>

      <Grid>
        <Grid.Col span={12}>
          <Select
            label="Тип акції"
            placeholder="Оберіть тип акції"
            data={[
              { value: '', label: 'Без акції' },
              // { value: ProductPromoType.BUY_X_GET_Y, label: '1+1, 2+1 (Купи X, отримай Y)' },
              { value: ProductPromoType.PERCENTAGE_OFF, label: 'Відсоткова знижка' },
              { value: ProductPromoType.FIXED_DISCOUNT, label: 'Фіксована знижка' },
              // { value: ProductPromoType.BULK_DISCOUNT, label: 'Оптова знижка' },
              // { value: ProductPromoType.TIME_LIMITED, label: 'Обмежена за часом' }
            ]}
            value={form.values.promoType || ''}
            onChange={handlePromoTypeChange}
            comboboxProps={{ zIndex: 1001 }}
          />
        </Grid.Col>

        {/* Render promo fields based on type */}
        {renderPromoFields()}

        {/* Time limited specific field */}
        {form.values.promoType === ProductPromoType.TIME_LIMITED && (
          <Grid.Col span={12}>
            <DateTimePicker
              label="Дата закінчення акції"
              placeholder="Оберіть дату та час"
              valueFormat="DD.MM.YYYY HH:mm"
              minDate={new Date()}
              clearable
              {...form.getInputProps('promoEndsAt')}
            />
          </Grid.Col>
        )}
      </Grid>

      {/* Preview */}
      {renderPromoPreview()}
    </Card>
  );
};

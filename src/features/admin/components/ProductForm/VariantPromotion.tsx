// src/features/admin/components/ProductForm/VariantPromotion.tsx
import { Grid, Select, NumberInput, Text, Alert, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { ProductPromoType } from '@/shared/types/generated.types';

interface VariantPromotionProps {
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
  onPromoTypeChange: (value: string | null) => void;
  onPromoConfigChange: (config: any) => void;
  onPromoEndsAtChange: (date: Date | null) => void;
  onPromotionChange?: (data: {
    promoType: string | null;
    promoConfig: any;
    promoEndsAt?: Date | null;
  }) => void;
  compact?: boolean;
}

export const VariantPromotion = ({
  promoType,
  promoConfig,
  promoEndsAt,
  onPromoTypeChange,
  onPromoConfigChange,
  onPromoEndsAtChange,
  onPromotionChange,
  compact = false,
}: VariantPromotionProps) => {
  const handlePromoTypeChange = (value: string | null) => {
    let newConfig = null;

    // Set proper initial promoConfig for each type
    if (value === ProductPromoType.BUY_X_GET_Y) {
      newConfig = { buyQuantity: 1, getQuantity: 1 };
    } else if (value === ProductPromoType.PERCENTAGE_OFF || value === ProductPromoType.TIME_LIMITED) {
      newConfig = { percentage: 10 };
    } else if (value === ProductPromoType.FIXED_DISCOUNT) {
      newConfig = { amount: 0 };
    } else if (value === ProductPromoType.BULK_DISCOUNT) {
      newConfig = { minQuantity: 2, discountPercentage: 10 };
    }

    // Use combined callback if available, otherwise use separate callbacks
    if (onPromotionChange) {
      onPromotionChange({
        promoType: value,
        promoConfig: newConfig,
        promoEndsAt: value === ProductPromoType.TIME_LIMITED ? promoEndsAt : null,
      });
    } else {
      onPromoTypeChange(value);
      onPromoConfigChange(newConfig);
      // Clear promoEndsAt when removing promotion or changing to non-TIME_LIMITED type
      if (!value || value !== ProductPromoType.TIME_LIMITED) {
        onPromoEndsAtChange(null);
      }
    }
  };

  const renderPromoFields = () => {
    if (!promoType) return null;

    switch (promoType) {
      case ProductPromoType.BUY_X_GET_Y:
        return (
          <>
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Кількість для покупки"
                placeholder="2"
                size={compact ? 'xs' : 'sm'}
                min={1}
                required
                value={promoConfig?.buyQuantity || 1}
                onChange={(value) =>
                  onPromoConfigChange({
                    ...promoConfig,
                    buyQuantity: value || 1,
                    getQuantity: promoConfig?.getQuantity || 1,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Кількість безкоштовно"
                placeholder="1"
                size={compact ? 'xs' : 'sm'}
                min={1}
                required
                value={promoConfig?.getQuantity || 1}
                onChange={(value) =>
                  onPromoConfigChange({
                    ...promoConfig,
                    buyQuantity: promoConfig?.buyQuantity || 1,
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
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Відсоток знижки"
                placeholder="20"
                size={compact ? 'xs' : 'sm'}
                min={1}
                max={90}
                required
                value={promoConfig?.percentage || 10}
                onChange={(value) =>
                  onPromoConfigChange({
                    percentage: value || 10,
                    maxDiscount: promoConfig?.maxDiscount,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Макс. знижка (грн)"
                placeholder="1000"
                size={compact ? 'xs' : 'sm'}
                min={0}
                value={promoConfig?.maxDiscount || 0}
                onChange={(value) =>
                  onPromoConfigChange({
                    percentage: promoConfig?.percentage || 10,
                    maxDiscount: value || undefined,
                  })
                }
              />
            </Grid.Col>
          </>
        );

      case ProductPromoType.FIXED_DISCOUNT:
        return (
          <Grid.Col span={compact ? 12 : 6}>
            <NumberInput
              label="Сума знижки (грн)"
              placeholder="100"
              size={compact ? 'xs' : 'sm'}
              min={0.01}
              required
              value={promoConfig?.amount || 0}
              onChange={(value) =>
                onPromoConfigChange({
                  amount: value || 0,
                })
              }
            />
          </Grid.Col>
        );

      case ProductPromoType.BULK_DISCOUNT:
        return (
          <>
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Мінімальна кількість"
                placeholder="5"
                size={compact ? 'xs' : 'sm'}
                min={2}
                required
                value={promoConfig?.minQuantity || 2}
                onChange={(value) =>
                  onPromoConfigChange({
                    ...promoConfig,
                    minQuantity: value || 2,
                    discountPercentage: promoConfig?.discountPercentage || 10,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={compact ? 6 : 6}>
              <NumberInput
                label="Відсоток знижки"
                placeholder="15"
                size={compact ? 'xs' : 'sm'}
                min={1}
                max={50}
                required
                value={promoConfig?.discountPercentage || 10}
                onChange={(value) =>
                  onPromoConfigChange({
                    ...promoConfig,
                    minQuantity: promoConfig?.minQuantity || 2,
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
    if (!promoType || !promoConfig) return null;

    let previewText = '';

    switch (promoType) {
      case ProductPromoType.BUY_X_GET_Y:
        previewText = `Купи ${promoConfig.buyQuantity} шт, отримай ${promoConfig.getQuantity} шт безкоштовно`;
        break;
      case ProductPromoType.PERCENTAGE_OFF:
      case ProductPromoType.TIME_LIMITED:
        previewText = `Знижка ${promoConfig.percentage}%`;
        if (promoConfig.maxDiscount) {
          previewText += ` (макс. ${promoConfig.maxDiscount} грн)`;
        }
        break;
      case ProductPromoType.FIXED_DISCOUNT:
        previewText = `Знижка ${promoConfig.amount} грн`;
        break;
      case ProductPromoType.BULK_DISCOUNT:
        previewText = `При покупці від ${promoConfig.minQuantity} шт - знижка ${promoConfig.discountPercentage}%`;
        break;
    }

    return (
      <Alert color="blue" variant="light" mt={compact ? 'xs' : 'md'}>
        <Text size="xs" fw={500} mb="xs">
          Попередній перегляд акції:
        </Text>
        <Text size="xs">{previewText}</Text>
      </Alert>
    );
  };

  return (
    <Stack gap={compact ? 'xs' : 'md'}>
      <Grid>
        <Grid.Col span={12}>
          <Select
            label="Тип акції"
            placeholder="Оберіть тип акції"
            size={compact ? 'xs' : 'sm'}
            clearable
            data={[
              { value: ProductPromoType.PERCENTAGE_OFF, label: 'Відсоткова знижка' },
              { value: ProductPromoType.FIXED_DISCOUNT, label: 'Фіксована знижка' },
              // { value: ProductPromoType.BUY_X_GET_Y, label: 'Купи X отримай Y' },
              // { value: ProductPromoType.BULK_DISCOUNT, label: 'Оптова знижка' },
              // { value: ProductPromoType.TIME_LIMITED, label: 'Обмежена за часом' },
            ]}
            value={promoType}
            onChange={handlePromoTypeChange}
            comboboxProps={{ zIndex: 1001 }}
          />
        </Grid.Col>

        {/* Render promo fields based on type */}
        {renderPromoFields()}

        {/* Time limited specific field */}
        {promoType === ProductPromoType.TIME_LIMITED && (
          <Grid.Col span={12}>
            <DateTimePicker
              label="Дата закінчення акції"
              placeholder="Оберіть дату та час"
              valueFormat="DD.MM.YYYY HH:mm"
              size={compact ? 'xs' : 'sm'}
              minDate={new Date()}
              clearable
              value={promoEndsAt}
              onChange={(value) => onPromoEndsAtChange(value as Date | null)}
            />
          </Grid.Col>
        )}
      </Grid>

      {/* Preview */}
      {renderPromoPreview()}
    </Stack>
  );
};

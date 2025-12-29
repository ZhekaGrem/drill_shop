import { Stack, Text } from '@mantine/core';
import { ProductVariantOptions } from '../ProductVariantOptions';
import { VariantPromotion } from '../VariantPromotion';

interface VariantDetailsProps {
  options: Record<string, any>;
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
  onOptionsChange: (options: Record<string, any>) => void;
  onPromotionChange: (data: {
    promoType: string | null;
    promoConfig: any;
    promoEndsAt?: Date | null;
  }) => void;
}

export const VariantDetails = ({
  options,
  promoType,
  promoConfig,
  promoEndsAt,
  onOptionsChange,
  onPromotionChange,
}: VariantDetailsProps) => {
  return (
    <Stack gap="md">
      {/* Характеристики */}
      <div>
        <Text size="xs" fw={500} mb="xs">
          Характеристики варіанту:
        </Text>
        <ProductVariantOptions options={options} onChange={onOptionsChange} />
      </div>

      {/* Акції */}
      <div>
        <Text size="xs" fw={500} mb="xs">
          Акції для варіанту:
        </Text>
        <VariantPromotion
          compact
          promoType={promoType}
          promoConfig={promoConfig}
          promoEndsAt={promoEndsAt}
          onPromoTypeChange={(value) =>
            onPromotionChange({ promoType: value || null, promoConfig, promoEndsAt })
          }
          onPromoConfigChange={(config) =>
            onPromotionChange({ promoType: promoType || null, promoConfig: config, promoEndsAt })
          }
          onPromoEndsAtChange={(date) =>
            onPromotionChange({ promoType: promoType || null, promoConfig, promoEndsAt: date })
          }
          onPromotionChange={onPromotionChange}
        />
      </div>
    </Stack>
  );
};

import { Text, Stack } from '@mantine/core';
import { VariantItem } from './VariantItem';

interface Variant {
  id?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unitValue?: number;
  options: Record<string, any>;
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

interface VariantsListProps {
  variants: Variant[];
  expandedVariants: Set<number>;
  validateVariantSku: (sku: string, index: number) => string | null;
  onUpdate: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
  onToggle: (index: number) => void;
  onPromotionChange: (
    index: number,
    data: { promoType: string | null; promoConfig: any; promoEndsAt?: Date | null }
  ) => void;
}

export const VariantsList = ({
  variants,
  expandedVariants,
  validateVariantSku,
  onUpdate,
  onDelete,
  onToggle,
  onPromotionChange,
}: VariantsListProps) => {
  if (variants.length === 0) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Text size="sm" fw={500} mb="xs">
        Існуючі варіанти:
      </Text>
      <Stack gap="xs">
        {variants.map((variant, index) => {
          const skuError = validateVariantSku(variant.sku, index);
          const isExpanded = expandedVariants.has(index);

          return (
            <VariantItem
              key={index}
              variant={variant}
              index={index}
              isExpanded={isExpanded}
              skuError={skuError}
              onUpdate={(field, value) => onUpdate(index, field, value)}
              onDelete={() => onDelete(index)}
              onToggle={() => onToggle(index)}
              onPromotionChange={(data) => onPromotionChange(index, data)}
            />
          );
        })}
      </Stack>
    </div>
  );
};

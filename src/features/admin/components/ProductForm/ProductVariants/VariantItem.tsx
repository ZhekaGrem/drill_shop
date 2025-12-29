import { Group, Text, ActionIcon, Collapse } from '@mantine/core';
import { IconTrash, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { VariantFields } from './VariantFields';
import { VariantDetails } from './VariantDetails';

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

interface VariantItemProps {
  variant: Variant;
  index: number;
  isExpanded: boolean;
  skuError?: string | null;
  onUpdate: (field: string, value: any) => void;
  onDelete: () => void;
  onToggle: () => void;
  onPromotionChange: (data: { promoType: string | null; promoConfig: any; promoEndsAt?: Date | null }) => void;
}

export const VariantItem = ({
  variant,
  isExpanded,
  skuError,
  onUpdate,
  onDelete,
  onToggle,
  onPromotionChange,
}: VariantItemProps) => {
  return (
    <div
      style={{
        border: skuError ? '1px solid #ff6b6b' : '1px solid #e5e5e5',
        borderRadius: '4px',
        backgroundColor: skuError ? '#fff5f5' : 'transparent',
      }}>
      <Group justify="space-between" style={{ padding: '8px 12px' }}>
        <div style={{ flex: 1 }}>
          <VariantFields variant={variant} onUpdate={onUpdate} skuError={skuError} />

          {skuError && (
            <Text size="xs" c="red" mt="xs">
              {skuError}
            </Text>
          )}
        </div>

        <Group gap="xs">
          <ActionIcon size="sm" variant="light" onClick={onToggle} title="Характеристики">
            {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </ActionIcon>
          <ActionIcon color="red" size="sm" onClick={onDelete}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={isExpanded}>
        <div style={{ padding: '12px', borderTop: '1px solid #e5e5e5' }}>
          <VariantDetails
            options={variant.options}
            promoType={variant.promoType}
            promoConfig={variant.promoConfig}
            promoEndsAt={variant.promoEndsAt}
            onOptionsChange={(options) => onUpdate('options', options)}
            onPromotionChange={onPromotionChange}
          />
        </div>
      </Collapse>
    </div>
  );
};

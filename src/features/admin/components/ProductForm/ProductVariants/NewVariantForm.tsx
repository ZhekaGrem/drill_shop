import { Grid, TextInput, NumberInput, Group, Text, Collapse, Stack } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ProductVariantOptions } from '../ProductVariantOptions';
import { VariantPromotion } from '../VariantPromotion';

interface NewVariant {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unitValue?: number;
  costPrice?: number;
  options?: Record<string, any>;
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

interface NewVariantFormProps {
  newVariant: NewVariant;
  showOptions: boolean;
  validateSku: (sku: string) => string | null;
  onUpdate: (field: string, value: any) => void;
  onAdd: () => void;
  onToggleOptions: () => void;
}

export const NewVariantForm = ({
  newVariant,
  showOptions,
  validateSku,
  onUpdate,
  onAdd,
  onToggleOptions,
}: NewVariantFormProps) => {
  const skuError = newVariant.sku ? validateSku(newVariant.sku) : null;
  const isDisabled = !newVariant.sku?.trim() || newVariant.price <= 0 || !!skuError;

  return (
    <div
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '4px',
        padding: '12px',
      }}>
      <Grid>
        <Grid.Col span={2}>
          <TextInput
            label="Артикул"
            placeholder="VAR-001"
            value={newVariant.sku}
            onChange={(e) => onUpdate('sku', e.target.value)}
            error={skuError}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <TextInput
            label="Назва"
            placeholder="хліб чорний"
            value={newVariant.name}
            onChange={(e) => onUpdate('name', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="Ціна"
            placeholder="0"
            min={0.01}
            value={newVariant.price}
            onChange={(val) => onUpdate('price', Number(val) || 0)}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="Кількість на складі"
            placeholder="0"
            min={0}
            value={newVariant.quantity}
            onChange={(val) => onUpdate('quantity', Number(val) || 0)}
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <NumberInput
            label="Кількість одиниці товару"
            placeholder="0"
            min={0}
            decimalScale={3}
            value={newVariant.unitValue || 0}
            onChange={(val) => onUpdate('unitValue', Number(val) || 0)}
          />
        </Grid.Col>
        <Grid.Col span={1}>
          <Group>
            <Button style={{ marginTop: '25px' }} onClick={onAdd} disabled={isDisabled} size="sm">
              +
            </Button>
          </Group>
        </Grid.Col>
      </Grid>

      {/* New variant options section */}
      <Group justify="space-between" mt="md">
        <Text size="sm" fw={500}>
          Характеристики нового варіанту:
        </Text>
        <Button
          variant="ghost"
          onClick={onToggleOptions}
          rightSection={showOptions ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}>
          {showOptions ? 'Згорнути' : 'Налаштувати'}
        </Button>
      </Group>

      <Collapse in={showOptions}>
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <Stack gap="md">
            {/* Характеристики */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Характеристики:
              </Text>
              <ProductVariantOptions
                options={newVariant.options || {}}
                onChange={(options) => onUpdate('options', options)}
              />
            </div>

            {/* Акції */}
            <div>
              <Text size="sm" fw={500} mb="xs">
                Акції для варіанту:
              </Text>
              <VariantPromotion
                promoType={newVariant.promoType}
                promoConfig={newVariant.promoConfig}
                promoEndsAt={newVariant.promoEndsAt}
                onPromoTypeChange={(value) => onUpdate('promoType', value)}
                onPromoConfigChange={(config) => onUpdate('promoConfig', config)}
                onPromoEndsAtChange={(date) => onUpdate('promoEndsAt', date)}
                onPromotionChange={(data) => {
                  onUpdate('promoType', data.promoType);
                  onUpdate('promoConfig', data.promoConfig);
                  onUpdate('promoEndsAt', data.promoEndsAt || null);
                }}
              />
            </div>
          </Stack>
        </div>
      </Collapse>
    </div>
  );
};

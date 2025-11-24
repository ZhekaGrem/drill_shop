// src/features/admin/components/ProductForm/ProductVariants.tsx - WITH OPTIONS
import { useState } from 'react';
import {
  Card,
  Text,
  Stack,
  Group,
  Grid,
  TextInput,
  NumberInput,
  ActionIcon,
  Alert,
  Collapse,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconTrash, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { ProductFormData } from '@/shared/types/admin.types';
import { ProductVariantOptions } from './ProductVariantOptions';
import { VariantPromotion } from './VariantPromotion';
import { Button } from '@/shared/components/Button/Button';
interface Variant {
  id?: string;
  sku: string;
  name: string;
  price: number;
  costPrice?: number;
  unitValue?: number;
  quantity: number;
  options: Record<string, any>;
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

interface ProductVariantsProps {
  form: UseFormReturnType<ProductFormData>;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

export const ProductVariants = ({ form, variants, onVariantsChange }: ProductVariantsProps) => {
  const [newVariant, setNewVariant] = useState<Omit<Variant, 'options'> & { options?: Record<string, any> }>({
    sku: '',
    name: '',
    price: 0,
    quantity: 0,
    unitValue: 0,
    options: {},
    promoType: null,
    promoConfig: null,
    promoEndsAt: null,
  });

  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());
  const [showNewVariantOptions, setShowNewVariantOptions] = useState(false);

  // SKU validation
  const validateVariantSku = (sku: string, currentIndex: number): string | null => {
    if (!sku?.trim()) return "Артикул варіанту обов'язковий";

    const trimmedSku = sku.trim();

    // Check if matches main product SKU
    if (trimmedSku === form.values.sku?.trim()) {
      return 'Артикул варіанту не може співпадати з основним артикулом';
    }

    // Check for duplicates within variants
    const duplicateIndex = variants.findIndex(
      (v, index) => index !== currentIndex && v.sku?.trim() === trimmedSku
    );

    if (duplicateIndex !== -1) {
      return 'Цей артикул вже використовується в іншому варіанті';
    }

    return null;
  };

  const handleAddVariant = () => {
    const errors = [];

    // Validate all required fields
    if (!newVariant.sku?.trim()) {
      errors.push("Артикул варіанту обов'язковий");
    }

    if (newVariant.price <= 0) {
      errors.push('Ціна повинна бути більше 0');
    }

    // Validate SKU uniqueness
    if (newVariant.sku?.trim()) {
      const skuError = validateVariantSku(newVariant.sku, -1);
      if (skuError) {
        errors.push(skuError);
      }
    }

    if (errors.length > 0) {
      alert(`Помилки валідації:\n${errors.join('\n')}`);
      return;
    }

    const newVariantData: Variant = {
      ...newVariant,
      sku: newVariant.sku.trim(),
      name: newVariant.name?.trim() || '',
      quantity: Number(newVariant.quantity) || 0,
      unitValue: Number(newVariant.unitValue) || 0,
      price: Number(newVariant.price),
      costPrice: newVariant.costPrice ? Number(newVariant.costPrice) : undefined,
      options: newVariant.options || {},
      promoType: newVariant.promoType || null,
      promoConfig: newVariant.promoConfig || null,
      promoEndsAt: newVariant.promoEndsAt || null,
    };

    onVariantsChange([...variants, newVariantData]);

    // Reset form with SKU suggestion
    const baseSku = form.values.sku?.trim() || 'VAR';
    const suggestedSku = `${baseSku}-${variants.length + 1}`;

    setNewVariant({
      sku: suggestedSku,
      name: '',
      price: form.values.price || 0,
      quantity: 0,
      unitValue: form.values.unitValue || 0,
      costPrice: form.values.costPrice || undefined,
      options: {},
    });

    setShowNewVariantOptions(false);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Validate SKU if it's being changed
    if (field === 'sku' && value) {
      const error = validateVariantSku(value, index);
      if (error) {
        alert(error);
        return;
      }
    }

    onVariantsChange(updated);
  };

  const handleUpdateVariantPromotion = (
    index: number,
    data: { promoType: string | null; promoConfig: any; promoEndsAt?: Date | null }
  ) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      promoType: data.promoType,
      promoConfig: data.promoConfig,
      promoEndsAt: data.promoEndsAt || null,
    };
    onVariantsChange(updated);
  };

  const handleDeleteVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
    setExpandedVariants((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const toggleVariantOptions = (index: number) => {
    setExpandedVariants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Варіанти товару
      </Text>

      {variants.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <Text size="sm" fw={500} mb="xs">
            Існуючі варіанти:
          </Text>
          <Stack gap="xs">
            {variants.map((variant, index) => {
              const skuError = validateVariantSku(variant.sku, index);
              const isExpanded = expandedVariants.has(index);

              return (
                <div
                  key={index}
                  style={{
                    border: skuError ? '1px solid #ff6b6b' : '1px solid #e5e5e5',
                    borderRadius: '4px',
                    backgroundColor: skuError ? '#fff5f5' : 'transparent',
                  }}>
                  <Group justify="space-between" style={{ padding: '8px 12px' }}>
                    <div style={{ flex: 1 }}>
                      <Grid>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Артикул
                          </Text>
                          <TextInput
                            value={variant.sku}
                            onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                            size="xs"
                            error={skuError}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Назва
                          </Text>
                          <TextInput
                            value={variant.name || ''}
                            onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                            size="xs"
                          />
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <Text size="xs" c="dimmed">
                            Ціна
                          </Text>
                          <NumberInput
                            value={variant.price}
                            onChange={(val) => handleUpdateVariant(index, 'price', val || 0)}
                            min={0.01}
                            size="xs"
                          />
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <Text size="xs" c="dimmed">
                            Кількість на складі
                          </Text>
                          <NumberInput
                            value={variant.quantity}
                            onChange={(val) => handleUpdateVariant(index, 'quantity', val || 0)}
                            min={0}
                            size="xs"
                          />
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <Text size="xs" c="dimmed">
                            Кількість одиниці товару
                          </Text>
                          <NumberInput
                            value={variant.unitValue || 0}
                            onChange={(val) => handleUpdateVariant(index, 'unitValue', val || 0)}
                            min={0}
                            decimalScale={3}
                            size="xs"
                          />
                        </Grid.Col>
                      </Grid>

                      {skuError && (
                        <Text size="xs" c="red" mt="xs">
                          {skuError}
                        </Text>
                      )}
                    </div>

                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        onClick={() => toggleVariantOptions(index)}
                        title="Характеристики">
                        {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                      </ActionIcon>
                      <ActionIcon color="red" size="sm" onClick={() => handleDeleteVariant(index)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Collapse in={isExpanded}>
                    <div style={{ padding: '12px', borderTop: '1px solid #e5e5e5' }}>
                      <Stack gap="md">
                        {/* Характеристики */}
                        <div>
                          <Text size="xs" fw={500} mb="xs">
                            Характеристики варіанту:
                          </Text>
                          <ProductVariantOptions
                            options={variant.options}
                            onChange={(options) => handleUpdateVariant(index, 'options', options)}
                          />
                        </div>

                        {/* Акції */}
                        <div>
                          <Text size="xs" fw={500} mb="xs">
                            Акції для варіанту:
                          </Text>
                          <VariantPromotion
                            compact
                            promoType={variant.promoType}
                            promoConfig={variant.promoConfig}
                            promoEndsAt={variant.promoEndsAt}
                            onPromoTypeChange={(value) => handleUpdateVariant(index, 'promoType', value)}
                            onPromoConfigChange={(config) =>
                              handleUpdateVariant(index, 'promoConfig', config)
                            }
                            onPromoEndsAtChange={(date) => handleUpdateVariant(index, 'promoEndsAt', date)}
                            onPromotionChange={(data) => handleUpdateVariantPromotion(index, data)}
                          />
                        </div>
                      </Stack>
                    </div>
                  </Collapse>
                </div>
              );
            })}
          </Stack>
        </div>
      )}

      <Text size="sm" fw={500} mb="md" c="dimmed">
        Додати новий варіант:
      </Text>

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
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
              error={newVariant.sku ? validateVariantSku(newVariant.sku, -1) : null}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Назва"
              placeholder="хліб чорний"
              value={newVariant.name}
              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <NumberInput
              label="Ціна"
              placeholder="0"
              min={0.01}
              value={newVariant.price}
              onChange={(val) => setNewVariant({ ...newVariant, price: Number(val) || 0 })}
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <NumberInput
              label="Кількість на складі"
              placeholder="0"
              min={0}
              value={newVariant.quantity}
              onChange={(val) => setNewVariant({ ...newVariant, quantity: Number(val) || 0 })}
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <NumberInput
              label="Кількість одиниці товару"
              placeholder="0"
              min={0}
              decimalScale={3}
              value={newVariant.unitValue || 0}
              onChange={(val) => setNewVariant({ ...newVariant, unitValue: Number(val) || 0 })}
            />
          </Grid.Col>
          <Grid.Col span={1}>
            <Group>
              <Button
                style={{ marginTop: '25px' }}
                onClick={handleAddVariant}
                disabled={
                  !newVariant.sku?.trim() || newVariant.price <= 0 || !!validateVariantSku(newVariant.sku, -1)
                }
                size="sm">
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
            onClick={() => setShowNewVariantOptions(!showNewVariantOptions)}
            rightSection={
              showNewVariantOptions ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />
            }>
            {showNewVariantOptions ? 'Згорнути' : 'Налаштувати'}
          </Button>
        </Group>

        <Collapse in={showNewVariantOptions}>
          <div
            style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <Stack gap="md">
              {/* Характеристики */}
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Характеристики:
                </Text>
                <ProductVariantOptions
                  options={newVariant.options || {}}
                  onChange={(options) => setNewVariant({ ...newVariant, options })}
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
                  onPromoTypeChange={(value) => setNewVariant({ ...newVariant, promoType: value })}
                  onPromoConfigChange={(config) => setNewVariant({ ...newVariant, promoConfig: config })}
                  onPromoEndsAtChange={(date) => setNewVariant({ ...newVariant, promoEndsAt: date })}
                  onPromotionChange={(data) =>
                    setNewVariant({
                      ...newVariant,
                      promoType: data.promoType,
                      promoConfig: data.promoConfig,
                      promoEndsAt: data.promoEndsAt || null,
                    })
                  }
                />
              </div>
            </Stack>
          </div>
        </Collapse>
      </div>

      {/* Helper text for SKU generation */}
      <Alert color="blue" variant="light" mt="md">
        <Text size="sm" fw={500} mb="xs">
          Поради щодо артикулів та характеристик:
        </Text>
        <Text size="sm">
          • Артикули повинні бути унікальними
          <br />• Використовуйте формат: {form.values.sku || 'ОСНОВНИЙ'}-1, {form.values.sku || 'ОСНОВНИЙ'}-2,
          тощо
          <br />
          • Артикул варіанту не може співпадати з основним артикулом
          <br />• Характеристики допомагають покупцям розрізняти варіанти (колір, розмір, смак тощо)
        </Text>
      </Alert>

      {variants.length > 0 && (
        <Alert color="green" variant="light" mt="md">
          <Text size="sm">
            ✅ Додано {variants.length} варіантів з характеристиками. Вони будуть збережені разом з товаром.
          </Text>
        </Alert>
      )}
    </Card>
  );
};

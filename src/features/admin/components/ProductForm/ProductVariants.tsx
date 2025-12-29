// src/features/admin/components/ProductForm/ProductVariants.tsx - Refactored with FSD
import { Card, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ProductFormData } from '@/shared/types/admin.types';
import { useVariantValidation } from '../../hooks/useVariantValidation';
import { useVariantState } from '../../hooks/useVariantState';
import { VariantsList } from './ProductVariants/VariantsList';
import { NewVariantForm } from './ProductVariants/NewVariantForm';
import { VariantsHelperText } from './ProductVariants/VariantsHelperText';

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
  const { validateVariantSku, validateNewVariant } = useVariantValidation(form.values.sku || '', variants);

  const {
    newVariant,
    setNewVariant,
    expandedVariants,
    showNewVariantOptions,
    setShowNewVariantOptions,
    resetNewVariant,
    toggleVariantOptions,
    removeVariantFromExpanded,
  } = useVariantState(
    form.values.sku || '',
    form.values.price || 0,
    form.values.unitValue || 0,
    form.values.costPrice
  );

  const handleAddVariant = () => {
    const errors = validateNewVariant(newVariant);

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
    resetNewVariant(variants.length);
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
    removeVariantFromExpanded(index);
  };

  const handleUpdateNewVariant = (field: string, value: any) => {
    setNewVariant({ ...newVariant, [field]: value });
  };

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Варіанти товару
      </Text>

      <VariantsList
        variants={variants}
        expandedVariants={expandedVariants}
        validateVariantSku={validateVariantSku}
        onUpdate={handleUpdateVariant}
        onDelete={handleDeleteVariant}
        onToggle={toggleVariantOptions}
        onPromotionChange={handleUpdateVariantPromotion}
      />

      <Text size="sm" fw={500} mb="md" c="dimmed">
        Додати новий варіант:
      </Text>

      <NewVariantForm
        newVariant={newVariant}
        showOptions={showNewVariantOptions}
        validateSku={(sku) => validateVariantSku(sku, -1)}
        onUpdate={handleUpdateNewVariant}
        onAdd={handleAddVariant}
        onToggleOptions={() => setShowNewVariantOptions(!showNewVariantOptions)}
      />

      <VariantsHelperText mainSku={form.values.sku || ''} variantsCount={variants.length} />
    </Card>
  );
};

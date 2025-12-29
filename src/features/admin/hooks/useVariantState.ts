import { useState } from 'react';

interface Variant {
  sku: string;
  name: string;
  price: number;
  costPrice?: number;
  unitValue?: number;
  quantity: number;
  options?: Record<string, any>;
  promoType?: string | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

export const useVariantState = (
  baseSku: string,
  basePrice: number,
  baseUnitValue: number,
  baseCostPrice?: number
) => {
  const getInitialVariant = () => ({
    sku: baseSku ? `${baseSku}-1` : '',
    name: '',
    price: basePrice || 0,
    quantity: 0,
    unitValue: baseUnitValue || 0,
    costPrice: baseCostPrice || undefined,
    options: {},
    promoType: null,
    promoConfig: null,
    promoEndsAt: null,
  });

  const [newVariant, setNewVariant] = useState<Variant>(getInitialVariant());
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());
  const [showNewVariantOptions, setShowNewVariantOptions] = useState(false);

  const resetNewVariant = (variantsLength: number) => {
    const suggestedSku = baseSku ? `${baseSku}-${variantsLength + 1}` : `VAR-${variantsLength + 1}`;

    setNewVariant({
      sku: suggestedSku,
      name: '',
      price: basePrice || 0,
      quantity: 0,
      unitValue: baseUnitValue || 0,
      costPrice: baseCostPrice || undefined,
      options: {},
      promoType: null,
      promoConfig: null,
      promoEndsAt: null,
    });

    setShowNewVariantOptions(false);
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

  const removeVariantFromExpanded = (index: number) => {
    setExpandedVariants((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  return {
    newVariant,
    setNewVariant,
    expandedVariants,
    showNewVariantOptions,
    setShowNewVariantOptions,
    resetNewVariant,
    toggleVariantOptions,
    removeVariantFromExpanded,
  };
};

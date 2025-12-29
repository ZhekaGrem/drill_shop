import { useState, useEffect, useMemo } from 'react';
import { ProductWithRelations } from '@/shared/types';
import { sortVariantsBySize } from '@/shared/utils/size-sort';

export const useProductVariants = (product: ProductWithRelations | null) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isMainProduct, setIsMainProduct] = useState(true);

  // Відсортовані варіанти за розміром
  const sortedVariants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    return sortVariantsBySize(product.variants);
  }, [product?.variants]);

  // Автоматично вибираємо перший варіант якщо hasVariants = true
  useEffect(() => {
    if (product?.hasVariants && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setIsMainProduct(false);
    } else if (product && !product.hasVariants) {
      setSelectedVariant(null);
      setIsMainProduct(true);
    }
  }, [product?.hasVariants, product?.variants]);

  // Перевіряємо чи показувати чекбокси для варіантів (size/color)
  const showVariantCheckboxes = useMemo(() => {
    if (!sortedVariants || sortedVariants.length === 0) return false;

    return sortedVariants.some((variant) => {
      const options = variant.options || {};
      const keys = Object.keys(options).map((k) => k.toLowerCase());
      return keys.includes('size') || keys.includes('color');
    });
  }, [sortedVariants]);

  const handleVariantChange = (variantId: string | null) => {
    if (variantId === null || variantId === 'main') {
      setSelectedVariant(null);
      setIsMainProduct(true);
    } else {
      const variant = sortedVariants.find((v) => v.id === variantId);
      setSelectedVariant(variant);
      setIsMainProduct(false);
    }
  };

  // Отримати значення варіанту для відображення (size або color)
  const getVariantDisplayValue = (variant: any): string => {
    if (!variant || !variant.options) return 'Варіант';

    const optionsKeys = Object.keys(variant.options);
    const targetKey = optionsKeys.find((key) => {
      const lowerKey = key.toLowerCase();
      return lowerKey === 'size' || lowerKey === 'color';
    });

    if (targetKey) {
      const value = variant.options[targetKey];
      return String(value);
    }

    const firstValue = Object.values(variant.options)[0];
    return firstValue ? String(firstValue) : 'Варіант';
  };

  // Отримати stock варіанту
  const getVariantStock = (variant: any) => {
    if (!variant) return 0;
    return (variant.quantity || 0) - (variant.reservedQuantity || 0);
  };

  return {
    selectedVariant,
    isMainProduct,
    sortedVariants,
    showVariantCheckboxes,
    handleVariantChange,
    getVariantDisplayValue,
    getVariantStock,
    setSelectedVariant,
    setIsMainProduct,
  };
};

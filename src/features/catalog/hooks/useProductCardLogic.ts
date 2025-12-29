// src/features/catalog/hooks/useProductCardLogic.ts
import { useState, useMemo } from 'react';
import { Product } from '@/shared/types';
import { sortVariantsBySize } from '@/shared/utils/size-sort';

interface UseProductCardLogicReturn {
  selectedVariant: string | null;
  setSelectedVariant: (variant: string | null) => void;
  isImageHovered: boolean;
  setIsImageHovered: (hovered: boolean) => void;
  sortedVariants: any[];
  selectedVariantObject: any;
  showVariantsInCatalog: boolean;
  variantLabel: string;
  isInStock: boolean;
  primaryImage: any;
  secondaryImage: any;
  imageUrl: string | undefined;
  getVariantDisplayValue: (variant: any) => string;
  getVariantStock: (variantId: string) => number;
}

/**
 * Hook для управління логікою ProductCard
 * Відповідає за варіанти, stock, зображення
 */
export const useProductCardLogic = (product: Product): UseProductCardLogicReturn => {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isImageHovered, setIsImageHovered] = useState(false);

  // Відсортовані варіанти за розміром
  const sortedVariants = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    return sortVariantsBySize(product.variants);
  }, [product.variants]);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.find((img) => img.isSecondary);
  const imageUrl =
    (isImageHovered && secondaryImage
      ? secondaryImage.url || secondaryImage.publicId
      : primaryImage?.url || primaryImage?.publicId) || undefined;

  // Отримати об'єкт обраного варіанту
  const selectedVariantObject = useMemo(() => {
    if (!selectedVariant || selectedVariant === 'main') return null;
    return sortedVariants.find((v) => v.id === selectedVariant) || null;
  }, [selectedVariant, sortedVariants]);

  // Перевіряємо чи показувати варіанти в каталозі (size/color)
  const showVariantsInCatalog = useMemo(() => {
    if (sortedVariants.length === 0) return false;

    // Перевіряємо чи головний товар має size/color
    const mainHasColorOrSize =
      product.options &&
      Object.keys(product.options).some((k) => {
        const key = k.toLowerCase();
        return key === 'size' || key === 'color';
      });

    if (mainHasColorOrSize) return true;

    // Перевіряємо ЧИ ХОЧА Б ОДИН варіант має size або color
    return sortedVariants.some((variant) => {
      const options = variant.options || {};
      const keys = Object.keys(options).map((k) => k.toLowerCase());
      return keys.includes('size') || keys.includes('color');
    });
  }, [sortedVariants, product.options]);

  // Отримати значення варіанту для відображення (size або color)
  const getVariantDisplayValue = (variant: any): string => {
    if (!variant || !variant.options) {
      return 'Варіант';
    }

    // Шукаємо саме 'size' або 'color' (незалежно від регістру)
    const optionsKeys = Object.keys(variant.options);
    const targetKey = optionsKeys.find((key) => {
      const lowerKey = key.toLowerCase();
      return lowerKey === 'size' || lowerKey === 'color';
    });

    // Якщо знайшли size або color — повертаємо його значення
    if (targetKey) {
      const value = variant.options[targetKey];
      return String(value);
    }

    // Якщо size/color немає, беремо першу доступну опцію
    const firstValue = Object.values(variant.options)[0];
    return firstValue ? String(firstValue) : 'Варіант';
  };

  // Лейбл для варіантів
  const variantLabel = useMemo(() => {
    if (!showVariantsInCatalog || sortedVariants.length === 0) return '';
    return 'Варіант:';
  }, [showVariantsInCatalog, sortedVariants]);

  // Отримати stock варіанту
  const getVariantStock = (variantId: string) => {
    const variant = sortedVariants.find((v) => v.id === variantId);
    if (!variant) return 0;
    return (variant.quantity || 0) - (variant.reservedQuantity || 0);
  };

  // Перевірка наявності товару (головного або варіантів)
  const isInStock = useMemo(() => {
    if (!product.hasVariants) {
      return product.isInStock ?? false;
    }

    // Якщо є варіанти - перевіряємо чи ХОЧА Б ОДИН в наявності
    if (product.variants && product.variants.length > 0) {
      const mainStock = product.availableQuantity || 0;
      const hasMainInStock = mainStock > 0;

      const hasVariantInStock = product.variants.some((v) => {
        const stock = v.quantity || 0;
        return stock > 0;
      });

      return hasMainInStock || hasVariantInStock;
    }

    return true;
  }, [product.hasVariants, product.isInStock, product.variants, product.availableQuantity]);

  return {
    selectedVariant,
    setSelectedVariant,
    isImageHovered,
    setIsImageHovered,
    sortedVariants,
    selectedVariantObject,
    showVariantsInCatalog,
    variantLabel,
    isInStock,
    primaryImage,
    secondaryImage,
    imageUrl,
    getVariantDisplayValue,
    getVariantStock,
  };
};

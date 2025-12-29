interface Variant {
  id?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  options: Record<string, any>;
}

export const useVariantValidation = (mainProductSku: string, variants: Variant[]) => {
  const validateVariantSku = (sku: string, currentIndex: number): string | null => {
    if (!sku?.trim()) return "Артикул варіанту обов'язковий";

    const trimmedSku = sku.trim();

    // Check if matches main product SKU
    if (trimmedSku === mainProductSku?.trim()) {
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

  const validateNewVariant = (newVariant: any): string[] => {
    const errors = [];

    if (!newVariant.sku?.trim()) {
      errors.push("Артикул варіанту обов'язковий");
    }

    if (newVariant.price <= 0) {
      errors.push('Ціна повинна бути більше 0');
    }

    if (newVariant.sku?.trim()) {
      const skuError = validateVariantSku(newVariant.sku, -1);
      if (skuError) {
        errors.push(skuError);
      }
    }

    return errors;
  };

  return {
    validateVariantSku,
    validateNewVariant,
  };
};

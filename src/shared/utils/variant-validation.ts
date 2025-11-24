// src/shared/utils/variant-validation.ts - FIXED Validation for product variants

export const validateVariants = (variants: any[], mainProductSku: string): string[] => {
  const errors: string[] = [];

  if (!variants || variants.length === 0) {
    return errors;
  }

  // Track SKUs to find duplicates (only between variants)
  const skuCounts = new Map<string, number>();
  const mainSkuLower = mainProductSku.toLowerCase();

  variants.forEach((variant, index) => {
    const variantLabel = `Варіант ${index + 1}`;

    // Check required fields
    if (!variant.sku?.trim()) {
      errors.push(`${variantLabel}: Артикул обов'язковий`);
      return;
    }

    const sku = variant.sku.trim().toLowerCase();

    // ✅ CRITICAL FIX: Check conflict with main product SKU
    if (sku === mainSkuLower) {
      errors.push(`${variantLabel}: Артикул співпадає з основним товаром (${mainProductSku})`);
      return; // Skip other checks for this variant
    }

    if (!variant.price || variant.price <= 0) {
      errors.push(`${variantLabel}: Ціна повинна бути більше 0`);
    }

    // Check SKU format
    if (!/^[a-zA-Z0-9_-]+$/.test(variant.sku)) {
      errors.push(
        `${variantLabel}: Артикул може містити лише англійські літери, цифри, дефіси та підкреслення`
      );
    }

    // Track SKU duplicates between variants
    const currentCount = skuCounts.get(sku) || 0;
    skuCounts.set(sku, currentCount + 1);

    // Check for negative quantities
    if (variant.quantity < 0) {
      errors.push(`${variantLabel}: Кількість не може бути негативною`);
    }

    // Check cost price if provided
    if (variant.costPrice && variant.costPrice < 0) {
      errors.push(`${variantLabel}: Собівартість не може бути негативною`);
    }

    // Check unit value if provided
    if (variant.unitValue && variant.unitValue <= 0) {
      errors.push(`${variantLabel}: Вага повинна бути більше 0`);
    }
  });

  // Check for SKU duplicates between variants
  skuCounts.forEach((count, sku) => {
    if (count > 1) {
      errors.push(`Дублікат артикулу між варіантами: "${sku}" (знайдено ${count} разів)`);
    }
  });

  return errors;
};

export const validateSingleVariant = (variant: any, index: number, allSkus: string[]): string[] => {
  const errors: string[] = [];
  const variantLabel = `Варіант ${index + 1}`;

  if (!variant.sku?.trim()) {
    errors.push(`${variantLabel}: Артикул обов'язковий`);
  } else {
    const sku = variant.sku.trim().toLowerCase();

    // Check format
    if (!/^[a-zA-Z0-9_-]+$/.test(variant.sku)) {
      errors.push(`${variantLabel}: Неправильний формат артикулу`);
    }

    // Check uniqueness (case-insensitive)
    if (allSkus.filter((s) => s.toLowerCase() === sku).length > 1) {
      errors.push(`${variantLabel}: Дублікат артикулу "${variant.sku}"`);
    }
  }

  if (!variant.price || variant.price <= 0) {
    errors.push(`${variantLabel}: Ціна повинна бути більше 0`);
  }

  if (variant.quantity < 0) {
    errors.push(`${variantLabel}: Кількість не може бути негативною`);
  }

  return errors;
};

import { Product, ProductPromoType, ProductVariant } from '@/shared/types/generated.types';

// Перевірка активності акції
export const isPromoActive = (product: Product): boolean => {
  if (!product || !product.promoType || !product.promoConfig) return false;
  if (product.promoEndsAt) {
    const endDate =
      typeof product.promoEndsAt === 'string' ? new Date(product.promoEndsAt) : product.promoEndsAt;
    if (new Date() > endDate) return false;
  }
  return true;
};

// Перевірка активності акції для варіанту
export const isVariantPromoActive = (variant: ProductVariant): boolean => {
  if (!variant || !variant.promoType || !variant.promoConfig) return false;
  if (variant.promoEndsAt) {
    const endDate =
      typeof variant.promoEndsAt === 'string' ? new Date(variant.promoEndsAt) : variant.promoEndsAt;
    if (new Date() > endDate) return false;
  }
  return true;
};

// Отримання тексту для плашки
export const getPromoBadgeText = (product: Product): string | null => {
  if (!isPromoActive(product)) return null;
  const config = product.promoConfig as any;

  switch (product.promoType) {
    case ProductPromoType.BUY_X_GET_Y:
      return `${config.buyQuantity}+${config.getQuantity}`;
    case ProductPromoType.PERCENTAGE_OFF:
      return `-${config.percentage}%`;
    case ProductPromoType.FIXED_DISCOUNT:
      return `-${config.amount}₴`;
    case ProductPromoType.BULK_DISCOUNT:
      return `${config.minQuantity}+ шт = -${config.discountPercentage}%`;
    default:
      return null;
  }
};

// Отримання тексту для плашки варіанту
export const getVariantPromoBadgeText = (variant: ProductVariant): string | null => {
  if (!isVariantPromoActive(variant)) return null;
  const config = variant.promoConfig as any;

  switch (variant.promoType) {
    case ProductPromoType.BUY_X_GET_Y:
      return `${config.buyQuantity}+${config.getQuantity}`;
    case ProductPromoType.PERCENTAGE_OFF:
      return `-${config.percentage}%`;
    case ProductPromoType.FIXED_DISCOUNT:
      return `-${config.amount}₴`;
    case ProductPromoType.BULK_DISCOUNT:
      return `${config.minQuantity}+ шт = -${config.discountPercentage}%`;
    default:
      return null;
  }
};

// Розрахунок ціни (тільки для PERCENTAGE_OFF та FIXED_DISCOUNT)
export const calculatePromoPrice = (
  product: Product
): {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
} => {
  const originalPrice = Number(product.price);

  if (!isPromoActive(product)) {
    return { originalPrice, finalPrice: originalPrice, hasDiscount: false };
  }

  const config = product.promoConfig as any;

  if (product.promoType === ProductPromoType.PERCENTAGE_OFF) {
    const discount = originalPrice * (config.percentage / 100);
    return {
      originalPrice,
      finalPrice: originalPrice - discount,
      hasDiscount: true,
    };
  }

  if (product.promoType === ProductPromoType.FIXED_DISCOUNT) {
    const discount = Math.min(config.amount, originalPrice);
    return {
      originalPrice,
      finalPrice: originalPrice - discount,
      hasDiscount: true,
    };
  }

  // Для BUY_X_GET_Y та BULK_DISCOUNT - без зміни ціни
  return { originalPrice, finalPrice: originalPrice, hasDiscount: false };
};

// Розрахунок ціни для варіанту (тільки для PERCENTAGE_OFF та FIXED_DISCOUNT)
export const calculateVariantPromoPrice = (
  variant: ProductVariant
): {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
} => {
  const originalPrice = Number(variant.price);

  if (!isVariantPromoActive(variant)) {
    return { originalPrice, finalPrice: originalPrice, hasDiscount: false };
  }

  const config = variant.promoConfig as any;

  if (variant.promoType === ProductPromoType.PERCENTAGE_OFF) {
    const discount = originalPrice * (config.percentage / 100);
    return {
      originalPrice,
      finalPrice: originalPrice - discount,
      hasDiscount: true,
    };
  }

  if (variant.promoType === ProductPromoType.FIXED_DISCOUNT) {
    const discount = Math.min(config.amount, originalPrice);
    return {
      originalPrice,
      finalPrice: originalPrice - discount,
      hasDiscount: true,
    };
  }

  // Для BUY_X_GET_Y та BULK_DISCOUNT - без зміни ціни
  return { originalPrice, finalPrice: originalPrice, hasDiscount: false };
};

// Розрахунок для кошика (повний розрахунок з кількістю)
export const calculateCartPromoPrice = (
  product: Product,
  quantity: number
): {
  originalTotal: number;
  finalTotal: number;
  savings: number;
  promoText: string | null;
} => {
  const originalPrice = Number(product.price);
  const originalTotal = originalPrice * quantity;

  if (!isPromoActive(product)) {
    return {
      originalTotal,
      finalTotal: originalTotal,
      savings: 0,
      promoText: null,
    };
  }

  const config = product.promoConfig as any;

  switch (product.promoType) {
    case ProductPromoType.BUY_X_GET_Y:
      return calculateBuyXGetY(originalPrice, quantity, config);

    case ProductPromoType.PERCENTAGE_OFF:
      return calculatePercentageOff(originalPrice, quantity, config);

    case ProductPromoType.FIXED_DISCOUNT:
      return calculateFixedDiscount(originalPrice, quantity, config);

    case ProductPromoType.BULK_DISCOUNT:
      return calculateBulkDiscount(originalPrice, quantity, config);

    default:
      return {
        originalTotal,
        finalTotal: originalTotal,
        savings: 0,
        promoText: null,
      };
  }
};

// Допоміжні функції для розрахунків
const calculateBuyXGetY = (price: number, qty: number, config: any) => {
  const { buyQuantity, getQuantity } = config;
  const promoSets = Math.floor(qty / (buyQuantity + getQuantity));
  const remainder = qty % (buyQuantity + getQuantity);
  const paidItems = promoSets * buyQuantity + Math.min(remainder, buyQuantity);

  const originalTotal = price * qty;
  const finalTotal = price * paidItems;

  return {
    originalTotal,
    finalTotal,
    savings: originalTotal - finalTotal,
    promoText: `${buyQuantity}+${getQuantity}`,
  };
};

const calculatePercentageOff = (price: number, qty: number, config: any) => {
  const { percentage, maxDiscount } = config;
  const originalTotal = price * qty;
  let discount = originalTotal * (percentage / 100);

  if (maxDiscount && discount > maxDiscount) {
    discount = maxDiscount;
  }

  return {
    originalTotal,
    finalTotal: originalTotal - discount,
    savings: discount,
    promoText: `-${percentage}%`,
  };
};

const calculateFixedDiscount = (price: number, qty: number, config: any) => {
  const { amount } = config;
  const originalTotal = price * qty;
  const discount = Math.min(amount * qty, originalTotal); // Фіксована знижка на кожен товар

  return {
    originalTotal,
    finalTotal: originalTotal - discount,
    savings: discount,
    promoText: `-${amount}₴`,
  };
};

const calculateBulkDiscount = (price: number, qty: number, config: any) => {
  const { minQuantity, discountPercentage } = config;
  const originalTotal = price * qty;

  if (qty < minQuantity) {
    return {
      originalTotal,
      finalTotal: originalTotal,
      savings: 0,
      promoText: `${minQuantity}+ шт = -${discountPercentage}%`,
    };
  }

  const discount = originalTotal * (discountPercentage / 100);

  return {
    originalTotal,
    finalTotal: originalTotal - discount,
    savings: discount,
    promoText: `-${discountPercentage}%`,
  };
};

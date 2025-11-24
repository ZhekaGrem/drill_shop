// src/shared/utils/cart-calculations.ts

export interface CartCalculations {
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  totalAmount: number;
  discountAmount?: number;
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  originalPrice: number; // Оригінальна ціна (без знижки)
  finalPrice: number; // Фінальна ціна (те саме що unitPrice, для зворотної сумісності)
  hasPromo: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    unitValue?: number | null;
    status: string;
    isActive: boolean;
    options?: any;

    availableQuantity?: number;
    primaryImage?: PrimaryImage | null;
    images?: Array<{
      url: string;
      altText?: string | null;
      isPrimary: boolean;
    }>;
    promoType?: string | null;
    promoConfig?: any | null;
    promoEndsAt?: Date | string | null;
  };
  variant?: {
    id: string;
    name?: string | null;
    price?: number;
    availableQuantity?: number;
    unitValue?: number | null;
    options?: any;
  } | null;
}

interface PrimaryImage {
  url: string;
  altText?: string | null;
}
// Розрахунок загальних показників кошика
export const calculateCartTotals = (items: CartItemWithProduct[]): CartCalculations => {
  const itemsCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // ЗМІНЕНО: використовуємо finalPrice з бекенду
  const subtotal = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const discountAmount = originalTotal - subtotal;

  return {
    itemsCount,
    totalQuantity,
    subtotal: originalTotal,
    totalAmount: subtotal,
    discountAmount,
  };
};

// Розрахунок ціни для одного item
export const calculateItemPrice = (
  basePrice: number,
  variantPrice?: number | null,
  quantity: number = 1
): { unitPrice: number; totalPrice: number } => {
  const unitPrice = variantPrice || basePrice;
  const totalPrice = unitPrice * quantity;

  return { unitPrice, totalPrice };
};

// Форматування ціни в гривнях
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

// Перевірка чи товар в наявності
export const isItemAvailable = (
  quantity: number,
  productQuantity: number,
  variantQuantity?: number | null
): boolean => {
  const availableQuantity = variantQuantity ?? productQuantity;
  return quantity <= availableQuantity && availableQuantity > 0;
};

// Отримання максимальної доступної кількості
export const getMaxAvailableQuantity = (productQuantity: number, variantQuantity?: number | null): number => {
  return Math.max(0, variantQuantity ?? productQuantity);
};

// src/features/admin/hooks/useOrderCalculations.ts
import { OrderItem, Order } from '@/shared/types/generated.types';

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
}

interface NewOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
}

interface OrderTotals {
  subtotal: number;
  totalAmount: number;
}

/**
 * Hook для розрахунків підсумків замовлення
 */
export const useOrderCalculations = () => {
  /**
   * Розрахунок підсумків замовлення
   * @param items - Поточні товари замовлення
   * @param newItems - Нові товари, що додаються
   * @param order - Дані замовлення (для доставки)
   * @returns Об'єкт з підсумками
   */
  const calculateTotals = (
    items: OrderItemEdit[],
    newItems: NewOrderItem[],
    order: Order | null
  ): OrderTotals => {
    // Розрахунок суми активних товарів
    const activeItems = items.filter((item) => !item.isRemoved);
    const subtotal = activeItems.reduce((sum, item) => {
      const quantity = item.newQuantity ?? item.quantity;
      const price = item.newUnitPrice ?? item.unitPrice;
      return sum + quantity * Number(price);
    }, 0);

    // Розрахунок суми нових товарів
    const newItemsTotal = newItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return {
      subtotal: subtotal + newItemsTotal,
      totalAmount: subtotal + newItemsTotal + Number(order?.shippingAmount || 0),
    };
  };

  /**
   * Отримання активних (не видалених) товарів
   */
  const getActiveItems = (items: OrderItemEdit[]): OrderItemEdit[] => {
    return items.filter((item) => !item.isRemoved);
  };

  return {
    calculateTotals,
    getActiveItems,
  };
};

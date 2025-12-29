// src/features/admin/hooks/useOrderItems.ts
import { useState } from 'react';
import { OrderItem, Product } from '@/shared/types/generated.types';

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
  product?: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface NewOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  product: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface UseOrderItemsReturn {
  newItems: NewOrderItem[];
  setNewItems: React.Dispatch<React.SetStateAction<NewOrderItem[]>>;
  updateItemQuantity: (
    itemId: string,
    quantity: number,
    setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>
  ) => void;
  updateItemPrice: (
    itemId: string,
    price: number,
    setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>
  ) => void;
  removeItem: (itemId: string, setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>) => void;
  handleAddProduct: (
    selectedProductId: string,
    selectedVariantId: string,
    availableProducts: Product[],
    onSuccess: () => void
  ) => void;
}

/**
 * Hook для управління товарами в замовленні
 * Відповідає за додавання, оновлення та видалення товарів
 */
export const useOrderItems = (): UseOrderItemsReturn => {
  const [newItems, setNewItems] = useState<NewOrderItem[]>([]);

  // Оновлення кількості товару
  const updateItemQuantity = (
    itemId: string,
    quantity: number,
    setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, newQuantity: quantity, isModified: true } : item))
    );
  };

  // Оновлення ціни товару
  const updateItemPrice = (
    itemId: string,
    price: number,
    setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, newUnitPrice: price, isModified: true } : item))
    );
  };

  // Видалення товару
  const removeItem = (itemId: string, setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isRemoved: true } : item)));
  };

  // Додавання нового товару до замовлення
  const handleAddProduct = (
    selectedProductId: string,
    selectedVariantId: string,
    availableProducts: Product[],
    onSuccess: () => void
  ) => {
    if (!selectedProductId) {
      alert('Оберіть товар зі списку');
      return;
    }

    const product = availableProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    let selectedVariant = null;
    if (selectedVariantId) {
      selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
    }

    // Перевірка на дублікат
    const isDuplicate = newItems.some(
      (item) => item.productId === selectedProductId && item.variantId === selectedVariantId
    );

    if (isDuplicate) {
      alert('Цей товар вже додано до списку');
      return;
    }

    const newItem: NewOrderItem = {
      productId: product.id,
      variantId: selectedVariantId || undefined,
      quantity: 1,
      unitPrice: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
      product: product,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name || undefined,
            sku: selectedVariant.sku,
          }
        : undefined,
    };

    setNewItems((prev) => [...prev, newItem]);
    onSuccess(); // Callback для очищення стану після успішного додавання
  };

  return {
    newItems,
    setNewItems,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    handleAddProduct,
  };
};

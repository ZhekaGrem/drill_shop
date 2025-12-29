import { ProductWithRelations } from '@/shared/types';

export const useProductStock = (product: ProductWithRelations | null, selectedVariant: any) => {
  const getCurrentStock = () => {
    if (selectedVariant) {
      // Обрано варіант - перевіряємо ТІЛЬКИ його
      const availableStock = (selectedVariant.quantity || 0) - (selectedVariant.reservedQuantity || 0);
      return {
        isInStock: availableStock > 0,
        availableQuantity: availableStock,
      };
    }

    // Обрано головний товар (або нічого не обрано) - перевіряємо ТІЛЬКИ його
    if (product) {
      const mainStock = (product.quantity || 0) - (product.reservedQuantity || 0);
      return {
        isInStock: mainStock > 0,
        availableQuantity: mainStock,
      };
    }

    return {
      isInStock: false,
      availableQuantity: 0,
    };
  };

  const getCurrentWeight = () => {
    return selectedVariant ? selectedVariant.unitValue : product?.unitValue;
  };

  const { isInStock, availableQuantity } = getCurrentStock();

  return {
    isInStock,
    availableQuantity,
    getCurrentWeight,
  };
};

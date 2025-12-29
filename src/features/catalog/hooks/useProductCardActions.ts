// src/features/catalog/hooks/useProductCardActions.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/shared/types';
import { useCart } from '@/features/cart/hooks/useCart';
import { useTimeout } from '@/shared/hooks';
import { showNotification } from '@/shared/utils/notifications';

interface UseProductCardActionsParams {
  product: Product;
  selectedVariant: string | null;
  selectedVariantObject: any;
  showVariantsInCatalog: boolean;
  variantLabel: string;
  enableQuickView: boolean;
  onQuickViewOpen?: () => void;
}

interface UseProductCardActionsReturn {
  isClicked: boolean;
  handleAddToCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleCardClick: () => void;
  getButtonText: () => string;
}

/**
 * Hook для управління діями ProductCard
 * Відповідає за додавання в кошик та навігацію
 */
export const useProductCardActions = ({
  product,
  selectedVariant,
  selectedVariantObject,
  showVariantsInCatalog,
  variantLabel,
  enableQuickView,
  onQuickViewOpen,
}: UseProductCardActionsParams): UseProductCardActionsReturn => {
  const router = useRouter();
  const { addItem } = useCart();
  const { setTimeoutSafe } = useTimeout();
  const [isClicked, setIsClicked] = useState(false);

  const isInStock = product.hasVariants
    ? product.variants?.some((v) => (v.quantity || 0) > 0) || (product.availableQuantity || 0) > 0
    : (product.isInStock ?? false);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isClicked) return;

      // Якщо варіанти SIZE/COLOR в каталозі - перевіряємо вибір
      if (showVariantsInCatalog) {
        if (!selectedVariant && selectedVariant !== 'main') {
          showNotification({
            message: 'Оберіть розмір',
          });
          return;
        }
      }

      // Якщо товар-контейнер (hasVariants = true), головний товар не можна купити
      if (product.hasVariants && selectedVariant === 'main') {
        showNotification({
          message: 'Оберіть розмір',
        });
        return;
      }

      // Якщо обрано головний товар ('main')
      if (selectedVariant === 'main') {
        setIsClicked(true);
        setTimeoutSafe(() => setIsClicked(false), 2000);

        const productData = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          unitValue: product.unitValue,
          primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
          promoType: product.promoType,
          promoConfig: product.promoConfig,
          promoEndsAt: product.promoEndsAt,
          variants: product.variants,
        };

        addItem(product.id, 1, undefined, productData);
        return;
      }

      // Якщо варіанти БЕЗ SIZE/COLOR
      if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
        if (enableQuickView && onQuickViewOpen) {
          onQuickViewOpen();
        } else {
          router.push(`/catalog/${product.slug}`);
        }
        return;
      }

      // Якщо товар-контейнер (hasVariants = true), варіант обов'язковий
      if (product.hasVariants && !selectedVariant) {
        showNotification({
          message: 'Оберіть варіант товару',
        });
        return;
      }

      setIsClicked(true);
      setTimeoutSafe(() => setIsClicked(false), 2000);

      const productData = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: selectedVariantObject?.price || product.price,
        unitValue: selectedVariantObject?.unitValue || product.unitValue,
        primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
        promoType: selectedVariantObject?.promoType || product.promoType,
        promoConfig: selectedVariantObject?.promoConfig || product.promoConfig,
        promoEndsAt: selectedVariantObject?.promoEndsAt || product.promoEndsAt,
        variants: product.variants,
      };

      addItem(product.id, 1, selectedVariant || undefined, productData);
    },
    [
      isClicked,
      showVariantsInCatalog,
      selectedVariant,
      variantLabel,
      product,
      selectedVariantObject,
      addItem,
      setTimeoutSafe,
      enableQuickView,
      onQuickViewOpen,
      router,
    ]
  );

  const handleCardClick = () => {
    if (enableQuickView && onQuickViewOpen) {
      // Quick View disabled for now
      // onQuickViewOpen();
    } else {
      router.push(`/catalog/${product.slug}`);
    }
  };

  const getButtonText = () => {
    if (isClicked) return 'ДОДАЄМО В ДРІЛ';
    if (!isInStock) return 'НЕМАЄ';

    // Якщо є варіанти БЕЗ size/color - показуємо "Деталі" для Quick View
    if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
      return 'ДЕТАЛІ';
    }

    return 'ДОДАТИ В КОШИК';
  };

  return {
    isClicked,
    handleAddToCart,
    handleCardClick,
    getButtonText,
  };
};

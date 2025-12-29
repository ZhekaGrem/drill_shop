import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/hooks/useCart';
import { ProductWithRelations } from '@/shared/types';

export const useProductCart = (
  product: ProductWithRelations | null,
  selectedVariant: any,
  isInStock: boolean
) => {
  const router = useRouter();
  const { addItem, isAddingItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isClicked, setIsClicked] = useState(false);

  const handleQuantityChange = (newQuantity: number, maxQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.hasVariants && !selectedVariant) {
      alert('Оберіть варіант товару');
      return;
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 2000);

    const productData = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant?.price || product.price,
      unitValue: selectedVariant?.unitValue || product.unitValue,
      primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
      variants: product.variants,
      promoType: selectedVariant?.promoType || product.promoType,
      promoConfig: selectedVariant?.promoConfig || product.promoConfig,
      promoEndsAt: selectedVariant?.promoEndsAt || product.promoEndsAt,
    };

    if (selectedVariant) {
      addItem(product.id, quantity, selectedVariant.id, productData);
    } else {
      addItem(product.id, quantity, undefined, productData);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push('/checkout'), 500);
  };

  const getButtonText = () => {
    if (isClicked) return 'Додано в кошик';
    if (isAddingItem) return 'Додавання...';
    if (!isInStock) return 'Немає в наявності';
    return 'Додати в кошик';
  };

  return {
    quantity,
    isClicked,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    getButtonText,
    setQuantity,
  };
};

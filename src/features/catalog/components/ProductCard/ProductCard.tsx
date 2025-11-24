// src/features/catalog/components/ProductCard/ProductCard.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import { useCart } from '@/features/cart/hooks/useCart';
import { useTimeout } from '@/shared/hooks';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { Button } from '@/shared/components/Button/Button';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import { ProductQuickViewModal } from '@/features/catalog/components/ProductQuickViewModal';
import { notifications } from '@mantine/notifications';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  className?: string;
}

// ✅ ОПТИМІЗОВАНО: React.memo для запобігання непотрібним ререндерам
export const ProductCard = React.memo<ProductCardProps>(({ product, className = '' }) => {
  const { addItem, isAddingItem } = useCart();
  const { setTimeoutSafe } = useTimeout();
  const [isClicked, setIsClicked] = useState(false);
  const [quickViewOpened, setQuickViewOpened] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const priceData = calculatePromoPrice(product);

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || primaryImage?.publicId;

  // ✅ Отримати об'єкт обраного варіанту
  const selectedVariantObject = useMemo(() => {
    if (!selectedVariant || selectedVariant === 'main') return null;
    return product.variants?.find((v) => v.id === selectedVariant) || null;
  }, [selectedVariant, product.variants]);

  // ✅ Перевіряємо чи показувати варіанти в каталозі (size/color)
  const showVariantsInCatalog = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return false;

    // Перевіряємо чи головний товар має size/color
    const mainHasColorOrSize =
      product.options &&
      Object.keys(product.options).some((k) => {
        const key = k.toLowerCase();
        return key === 'size' || key === 'color';
      });

    if (mainHasColorOrSize) return true;

    // Перевіряємо ЧИ ХОЧА Б ОДИН варіант має size або color
    return product.variants.some((variant) => {
      const options = variant.options || {};
      const keys = Object.keys(options).map((k) => k.toLowerCase());
      return keys.includes('size') || keys.includes('color');
    });
  }, [product.variants, product.options]);

  // Отримати значення варіанту для відображення (size або color)
  const getVariantDisplayValue = (variant: any) => {
    const options = variant.options || {};

    // Шукаємо size (пріоритет)
    const sizeKey = Object.keys(options).find((k) => k.toLowerCase() === 'size');
    if (sizeKey) return options[sizeKey];

    // Шукаємо color
    const colorKey = Object.keys(options).find((k) => k.toLowerCase() === 'color');
    if (colorKey) return options[colorKey];

    return variant.name || 'Варіант';
  };

  // Лейбл для варіантів
  const variantLabel = useMemo(() => {
    if (!showVariantsInCatalog || !product.variants || product.variants.length === 0) return '';

    // Перевіряємо головний товар
    if (product.options) {
      const keys = Object.keys(product.options).map((k) => k.toLowerCase());
      if (keys.includes('size')) return 'Розмір:';
      if (keys.includes('color')) return 'Колір:';
    }

    const firstVariant = product.variants[0];
    const options = firstVariant.options || {};
    const keys = Object.keys(options).map((k) => k.toLowerCase());

    if (keys.includes('size')) return 'Розмір:';
    if (keys.includes('color')) return 'Колір:';

    return 'Варіант:';
  }, [showVariantsInCatalog, product.variants, product.options]);

  // Отримати stock варіанту
  const getVariantStock = (variantId: string) => {
    const variant = product.variants?.find((v) => v.id === variantId);
    if (!variant) return 0;
    return (variant.quantity || 0) - (variant.reservedQuantity || 0);
  };

  // ✅ Перевірка наявності товару (головного або варіантів)
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

  const handleAddToCart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isClicked) return;

      // ✅ Якщо варіанти SIZE/COLOR в каталозі - перевіряємо вибір
      if (showVariantsInCatalog) {
        if (!selectedVariant && selectedVariant !== 'main') {
          notifications.show({
            message: `Оберіть ${variantLabel.replace(':', '')}`,
            color: 'yellow',
          });
          return;
        }
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

      // ✅ Якщо варіанти БЕЗ SIZE/COLOR - показати Quick View
      if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
        setQuickViewOpened(true);
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
    ]
  );

  const renderPrice = () => {
    // ✅ Якщо обрано варіант - показуємо його ціну з акцією (якщо є)
    if (selectedVariantObject) {
      const variantPriceData = calculateVariantPromoPrice(selectedVariantObject);

      if (variantPriceData.hasDiscount) {
        return (
          <>
            <span className={styles.originalPrice}>{variantPriceData.originalPrice}₴</span>
            <span className={styles.finalPrice}>{Math.round(variantPriceData.finalPrice)}₴</span>
          </>
        );
      }

      return <span className={styles.price}>{selectedVariantObject.price}₴</span>;
    }

    // ✅ Якщо не обрано варіант - показуємо ціну головного товару з промо
    if (priceData.hasDiscount) {
      return (
        <>
          <span className={styles.originalPrice}>{priceData.originalPrice}₴</span>
          <span className={styles.finalPrice}>{Math.round(priceData.finalPrice)}₴</span>
        </>
      );
    }
    return <span className={styles.price}>{product.price}₴</span>;
  };

  const getButtonText = () => {
    if (isClicked) return 'Додано';
    if (!isInStock) return 'Немає';

    // ✅ Якщо є варіанти БЕЗ size/color - показуємо "Деталі" для Quick View
    if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
      return 'Деталі';
    }

    return 'Додати';
  };

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.link} onClick={() => setQuickViewOpened(true)}>
        <div className={styles.productCardImageContainer}>
          <div className={styles.productCardImageContainer__ImageWrapper}>
            <CloudinaryImage
              src={imageUrl || '/assets/img/placeholder-product.jpeg'}
              alt={primaryImage?.altText || product.name}
              width={400}
              height={400}
              className={styles.productImage}
              loading="lazy"
            />
          </div>
          <ProductBadges product={product} selectedVariant={selectedVariantObject} />

          <div
            className={styles.favoriteButtonWrapper}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            <FavoriteButton product={product} />
          </div>
        </div>

        <div className={styles.content}>
          <Link href={`/catalog/${product.slug}`} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.title}>{product.name}</h3>
          </Link>

          {product.shortDescription && <p className={styles.description}>{product.shortDescription}</p>}

          {/* ✅ Показувати варіанти ТІЛЬКИ якщо SIZE/COLOR */}
          {showVariantsInCatalog && product.variants && product.variants.length > 0 && (
            <div className={styles.variants} onClick={(e) => e.stopPropagation()}>
              <label className={styles.variants__label}>{variantLabel}</label>

              <div className={styles.variants__options}>
                {/* Додаємо головний товар якщо він має size/color */}
                {product.options &&
                  Object.keys(product.options).some((k) => {
                    const key = k.toLowerCase();
                    return key === 'size' || key === 'color';
                  }) &&
                  (() => {
                    const mainStock = product.availableQuantity || 0;
                    const isOutOfStock = mainStock <= 0;

                    const displayValue = getVariantDisplayValue({
                      options: product.options,
                      name: product.name,
                    });
                    return (
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`${styles.variants__option} ${
                          selectedVariant === 'main' ? styles.variants__option_active : ''
                        } ${isOutOfStock ? styles.variants__option_disabled : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            setSelectedVariant('main');
                          }
                        }}>
                        {displayValue}
                        {isOutOfStock && ''}
                      </button>
                    );
                  })()}

                {/* Варіанти товару */}
                {product.variants.map((variant) => {
                  const stock = getVariantStock(variant.id);
                  const isOutOfStock = stock <= 0;
                  const displayValue = getVariantDisplayValue(variant);

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={isOutOfStock}
                      className={`${styles.variants__option} ${
                        selectedVariant === variant.id ? styles.variants__option_active : ''
                      } ${isOutOfStock ? styles.variants__option_disabled : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isOutOfStock) {
                          setSelectedVariant(variant.id);
                        }
                      }}>
                      {displayValue}
                      {isOutOfStock && ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.priceSection}>
              {renderPrice()}
              {(selectedVariantObject?.unitValue || product.unitValue) && (
                <span className={styles.unitValue}>
                  /{selectedVariantObject?.unitValue || product.unitValue} {product.unitDisplay}
                </span>
              )}
            </div>

            <div className={styles.actions}>
              <Button
                disabled={isClicked || !isInStock}
                onClick={handleAddToCart}
                type="button"
                size="sm"
                className={isClicked ? styles.addedButton : styles.addButton}>
                {getButtonText()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        opened={quickViewOpened}
        onClose={() => setQuickViewOpened(false)}
      />
    </div>
  );
});

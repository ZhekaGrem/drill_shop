// src/features/catalog/components/ProductCard/ProductCard.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCart3 } from '@/shared/components/Svg';
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
import { Group, Divider } from '@mantine/core';
import { IconX } from '@/shared/components/Svg';
import { sortVariantsBySize } from '@/shared/utils/size-sort';

interface ProductCardProps {
  product: Product;
  className?: string;
  enableQuickView?: boolean; // Включити/виключити Quick View модалку
}

// ✅ ОПТИМІЗОВАНО: React.memo для запобігання непотрібним ререндерам
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, className = '', enableQuickView = false }) => {
    const router = useRouter();
    const { addItem, isAddingItem } = useCart();
    const { setTimeoutSafe } = useTimeout();
    const [isClicked, setIsClicked] = useState(false);
    const [quickViewOpened, setQuickViewOpened] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [isImageHovered, setIsImageHovered] = useState(false);

    const priceData = calculatePromoPrice(product);

    // ✅ Відсортовані варіанти за розміром
    const sortedVariants = useMemo(() => {
      if (!product.variants || product.variants.length === 0) return [];
      return sortVariantsBySize(product.variants);
    }, [product.variants]);

    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const secondaryImage = product.images?.find((img) => img.isSecondary);
    const imageUrl =
      isImageHovered && secondaryImage
        ? secondaryImage.url || secondaryImage.publicId
        : primaryImage?.url || primaryImage?.publicId;

    // ✅ Отримати об'єкт обраного варіанту
    const selectedVariantObject = useMemo(() => {
      if (!selectedVariant || selectedVariant === 'main') return null;
      return sortedVariants.find((v) => v.id === selectedVariant) || null;
    }, [selectedVariant, sortedVariants]);

    // ✅ Перевіряємо чи показувати варіанти в каталозі (size/color)
    const showVariantsInCatalog = useMemo(() => {
      if (sortedVariants.length === 0) return false;

      // Перевіряємо чи головний товар має size/color
      const mainHasColorOrSize =
        product.options &&
        Object.keys(product.options).some((k) => {
          const key = k.toLowerCase();
          return key === 'size' || key === 'color';
        });

      if (mainHasColorOrSize) return true;

      // Перевіряємо ЧИ ХОЧА Б ОДИН варіант має size або color
      return sortedVariants.some((variant) => {
        const options = variant.options || {};
        const keys = Object.keys(options).map((k) => k.toLowerCase());
        return keys.includes('size') || keys.includes('color');
      });
    }, [sortedVariants, product.options]);

    // Отримати значення варіанту для відображення (size або color)
    const getVariantDisplayValue = (variant: any): string => {
      if (!variant || !variant.options) {
        return 'Варіант';
      }

      // 2. Шукаємо саме 'size' або 'color' (незалежно від регістру: Size, SIZE, color...)
      const optionsKeys = Object.keys(variant.options);
      const targetKey = optionsKeys.find((key) => {
        const lowerKey = key.toLowerCase();
        return lowerKey === 'size' || lowerKey === 'color';
      });

      // 3. Якщо знайшли size або color — повертаємо його значення
      if (targetKey) {
        const value = variant.options[targetKey];
        // String() гарантує, що ми повернемо стрічку, а не об'єкт, що виправить помилку
        return String(value);
      }

      // 4. Якщо size/color немає, беремо першу доступну опцію
      const firstValue = Object.values(variant.options)[0];
      return firstValue ? String(firstValue) : 'Варіант';
    };

    // Лейбл для варіантів
    const variantLabel = useMemo(() => {
      if (!showVariantsInCatalog || sortedVariants.length === 0) return '';
      return 'Варіант:';
    }, [showVariantsInCatalog, sortedVariants]);

    // Отримати stock варіанту
    const getVariantStock = (variantId: string) => {
      const variant = sortedVariants.find((v) => v.id === variantId);
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
              color: 'green',
              closeButtonProps: {
                icon: <IconX />,
                'aria-label': 'Закрити',
              },
            });
            return;
          }
        }

        // ✅ Якщо товар-контейнер (hasVariants = true), головний товар не можна купити
        if (product.hasVariants && selectedVariant === 'main') {
          notifications.show({
            message: `Оберіть ${variantLabel.replace(':', '')}`,
            color: 'yellow',
            closeButtonProps: {
              icon: <IconX />,
              'aria-label': 'Закрити',
            },
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

        // ✅ Якщо варіанти БЕЗ SIZE/COLOR
        if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
          if (enableQuickView) {
            // Показати Quick View якщо увімкнено
            setQuickViewOpened(false);
          } else {
            // Перенаправити на сторінку товару якщо QuickView вимкнено
            router.push(`/catalog/${product.slug}`);
          }
          return;
        }

        // ✅ Якщо товар-контейнер (hasVariants = true), варіант обов'язковий
        if (product.hasVariants && !selectedVariant) {
          notifications.show({
            message: 'Оберіть варіант товару',
            color: 'yellow',
            closeButtonProps: {
              icon: <IconX />,
              'aria-label': 'Закрити',
            },
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
      if (isClicked) return 'ДОДАЄМО В ДРІЛ';
      if (!isInStock) return 'НЕМАЄ';

      // ✅ Якщо є варіанти БЕЗ size/color - показуємо "Деталі" для Quick View
      if (product.variants && product.variants.length > 0 && !showVariantsInCatalog) {
        return 'ДЕТАЛІ';
      }

      return 'ДОДАТИ В КОШИК';
    };

    const handleCardClick = () => {
      if (enableQuickView) {
        // чи відкривати міні вікно з товаром  Quick View
        setQuickViewOpened(false);
      } else {
        router.push(`/catalog/${product.slug}`);
      }
    };

    return (
      <div className={`${styles.card} ${className}`}>
        <div className={styles.link} onClick={handleCardClick}>
          <div
            className={styles.productCardImageContainer}
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}>
            <div className={styles.productCardImageContainer__ImageWrapper}>
              <CloudinaryImage
                src={imageUrl || '/assets/img/placeholder-product.jpg'}
                alt={
                  isImageHovered && secondaryImage
                    ? secondaryImage.altText || product.name
                    : primaryImage?.altText || product.name
                }
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
              <h3 className={styles.title}>
                {isImageHovered && product.shortDescription ? product.shortDescription : product.name}
              </h3>
            </Link>
            <Divider className={styles.divider} />

            <Group justify="space-between" className={styles.contentPriceVariants}>
              <div className={styles.priceSection}>{renderPrice()}</div>
              {/* ✅ Показувати варіанти ТІЛЬКИ якщо SIZE/COLOR */}
              {showVariantsInCatalog && product.variants && product.variants.length > 0 && (
                <div className={styles.variants} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.variants__options}>
                    {/* Додаємо головний товар якщо він має size/color */}
                    {!product.hasVariants &&
                      product.options &&
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
                          <label
                            key="main"
                            className={`${styles.variantCheckbox} ${
                              isOutOfStock ? styles.variantCheckbox_disabled : ''
                            }`}>
                            <input
                              type="checkbox"
                              checked={selectedVariant === 'main'}
                              disabled={isOutOfStock}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) {
                                  setSelectedVariant('main');
                                }
                              }}
                            />
                            <span className={styles.variantCheckboxText}>{displayValue}</span>
                          </label>
                        );
                      })()}

                    {/* Варіанти товару */}
                    {sortedVariants.map((variant) => {
                      const stock = getVariantStock(variant.id);
                      const isOutOfStock = stock <= 0;
                      const displayValue = getVariantDisplayValue(variant);

                      return (
                        <label
                          key={variant.id}
                          className={`${styles.variantCheckbox} ${
                            isOutOfStock ? styles.variantCheckbox_disabled : ''
                          }`}>
                          <input
                            type="checkbox"
                            checked={selectedVariant === variant.id}
                            disabled={isOutOfStock}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (!isOutOfStock) {
                                setSelectedVariant(variant.id);
                              }
                            }}
                          />
                          <span className={styles.variantCheckboxText}>{displayValue}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </Group>
            <div className={styles.footer}></div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            disabled={isClicked || !isInStock}
            onClick={handleAddToCart}
            type="button"
            fullWidth
            variant="secondary"
            className={styles.addButton}>
            <Group gap={10}>
              <IconCart3 /> <p className={styles.buttonText}> {getButtonText()} </p>
            </Group>
          </Button>
        </div>
        {/* Quick View Modal */}
        {enableQuickView && (
          <ProductQuickViewModal
            product={product}
            opened={quickViewOpened}
            onClose={() => setQuickViewOpened(false)}
          />
        )}
      </div>
    );
  }
);

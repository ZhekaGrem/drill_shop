'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Modal, Select, Badge } from '@mantine/core';
import { Product } from '@/shared/types';
import { useCart } from '@/features/cart/hooks/useCart';
import { Button } from '@/shared/components/Button/Button';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import { getImageUrl } from '@/shared/utils/image';
import styles from './ProductQuickViewModal.module.scss';
import { sortVariantsBySize } from '@/shared/utils/size-sort';

interface ProductQuickViewModalProps {
  product: Product;
  opened: boolean;
  onClose: () => void;
}

export const ProductQuickViewModal = ({ product, opened, onClose }: ProductQuickViewModalProps) => {
  const { addItem, isAddingItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isClicked, setIsClicked] = useState(false);

  // ✅ Відсортовані варіанти за розміром
  const sortedVariants = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    return sortVariantsBySize(product.variants);
  }, [product.variants]);

  // ✅ Автоматично вибираємо перший варіант якщо hasVariants = true
  useEffect(() => {
    if (product.hasVariants && sortedVariants.length > 0) {
      setSelectedVariant(sortedVariants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product.hasVariants, sortedVariants]);

  const basePromoData = calculatePromoPrice(product);

  const images = product.images || [];
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [images]);

  const primaryImage = sortedImages[0] || images[0];
  const hasVariants = sortedVariants.length > 0;
  const hasOptions =
    product.options && typeof product.options === 'object' && Object.keys(product.options).length > 0;

  const getCurrentStock = () => {
    if (selectedVariant) {
      // ✅ Рахуємо доступний stock для варіанту
      const availableStock = (selectedVariant.quantity || 0) - (selectedVariant.reservedQuantity || 0);
      return {
        isInStock: availableStock > 0,
        availableQuantity: availableStock,
      };
    }

    if (product) {
      // ✅ Використовуємо availableQuantity якщо є, інакше рахуємо
      const mainStock =
        product.availableQuantity ?? (product.quantity || 0) - (product.reservedQuantity || 0);
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

  const { isInStock, availableQuantity } = getCurrentStock();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // ✅ Якщо товар-контейнер (hasVariants = true), варіант обов'язковий
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

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    return `${formatted} грн`;
  };

  const formatVariantOptions = (options: Record<string, any>): string => {
    if (!options || typeof options !== 'object' || Object.keys(options).length === 0) {
      return '';
    }

    const parts: string[] = [];

    Object.entries(options).forEach(([key, value]) => {
      if (value && String(value).trim()) {
        parts.push(String(value).trim());
      }
    });

    return parts.join(', ');
  };

  const createVariantDisplayLabel = (variant: any): string => {
    // Показуємо тільки назву варіанту без опцій
    return variant.name || `Варіант ${variant.sku}`;
  };

  const getCurrentWeight = () => {
    return selectedVariant ? selectedVariant.unitValue : product?.unitValue;
  };

  const getButtonText = () => {
    if (isClicked) return 'Додано в кошик';
    if (isAddingItem) return 'Додавання...';
    if (!isInStock) return 'Немає в наявності';

    return 'Додати в кошик';
  };

  return (
    <Modal opened={opened} onClose={onClose} size="xl" centered className={styles.modal}>
      <div className={styles.quickView}>
        {/* Галерея зображень */}
        <div className={styles.gallery}>
          <div className={styles.gallery__main}>
            <div className={styles.gallery__mainImageWrapper}>
              <CloudinaryImage
                src={getImageUrl(
                  sortedImages[selectedImageIndex]?.url ||
                    sortedImages[selectedImageIndex]?.publicId ||
                    primaryImage?.url ||
                    primaryImage?.publicId
                )}
                alt={product.name}
                className={styles.gallery__mainImage}
                width={500}
                height={500}
              />
            </div>
            <ProductBadges product={product} selectedVariant={selectedVariant} />

            {/* <div className={styles.favoriteButtonWrapper}>
              <FavoriteButton product={product} />
            </div> */}
          </div>

          {sortedImages.length > 1 && (
            <div className={styles.gallery__thumbnails}>
              {sortedImages.map((image, index) => (
                <Button
                  key={image.id}
                  className={`${styles.gallery__thumbnail} ${
                    index === selectedImageIndex ? styles.gallery__thumbnailActive : ''
                  }`}
                  variant="ghost"
                  size="fl"
                  onClick={() => setSelectedImageIndex(index)}>
                  <CloudinaryImage
                    src={getImageUrl(image.url || image.publicId)}
                    alt={image.altText || product.name}
                    width={60}
                    height={60}
                  />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Інфо про товар */}
        <div className={styles.info}>
          <h2 className={styles.info__title}>{product.name}</h2>

          <div className={styles.info__meta}>
            <span className={styles.info__sku}>{selectedVariant ? selectedVariant.sku : product.sku}</span>
          </div>

          <div className={styles.info__price}>
            {selectedVariant ? (
              (() => {
                const variantPriceData = calculateVariantPromoPrice(selectedVariant);
                if (variantPriceData.hasDiscount) {
                  return (
                    <>
                      <span className={styles.info__originalPrice}>
                        {formatPrice(variantPriceData.originalPrice)}
                      </span>
                      <span className={styles.info__currentPrice}>
                        {formatPrice(variantPriceData.finalPrice)}
                      </span>
                    </>
                  );
                }
                return (
                  <span className={styles.info__currentPrice}>{formatPrice(selectedVariant.price)}</span>
                );
              })()
            ) : basePromoData?.hasDiscount ? (
              <>
                <span className={styles.info__originalPrice}>{formatPrice(basePromoData.originalPrice)}</span>
                <span className={styles.info__currentPrice}>{formatPrice(basePromoData.finalPrice)}</span>
              </>
            ) : (
              <span className={styles.info__currentPrice}>{formatPrice(product?.price)}</span>
            )}
            {getCurrentWeight() && <span className={styles.info__pricePerKg}> / {getCurrentWeight()}</span>}{' '}
            {product.unitDisplay}
          </div>

          {product.shortDescription && (
            <div className={styles.info__description}>{product.shortDescription}</div>
          )}

          {/* Варіанти */}
          {hasVariants && sortedVariants.length > 0 && (
            <div className={styles.variants}>
              <Select
                className={styles.variants__select}
                radius="xs"
                label="Варіант:"
                size="md"
                onChange={(value) => {
                  if (value === 'main') {
                    setSelectedVariant(null);
                  } else {
                    const variant = sortedVariants.find((v) => v.id === value);
                    setSelectedVariant(variant);
                  }
                  setQuantity(1);
                }}
                data={[
                  // Показуємо головний товар тільки якщо hasVariants = false
                  ...(!product.hasVariants
                    ? [
                        {
                          value: 'main',
                          label: `${product.name}`,
                        },
                      ]
                    : []),
                  ...(sortedVariants.map((variant: any) => ({
                    value: variant.id,
                    label: createVariantDisplayLabel(variant),
                  })) || []),
                ]}
                placeholder="Оберіть варіант"
                value={selectedVariant?.id || (!product.hasVariants ? 'main' : undefined)}
              />

              {selectedVariant && selectedVariant.options && (
                <div className={styles.variants__options}>
                  {Object.keys(selectedVariant.options).length > 0 && (
                    <div>
                      <strong>Характеристики:</strong>
                      <div className={styles.variants__badges}>
                        {Object.entries(selectedVariant.options).map(([key, value]) => {
                          if (!value || !String(value).trim()) return null;

                          const optionLabels: Record<string, string> = {
                            color: 'Колір',
                            size: 'Розмір',
                            material: 'Матеріал',
                            brand: 'Бренд',
                            taste: 'Смак',
                            origin: 'Походження',
                          };

                          const label = optionLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                          return (
                            <Badge key={key} variant="outline" color="red" size="md">
                              {label}: {String(value)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {hasOptions && !selectedVariant && (
            <div className={styles.options}>
              <strong>Характеристики:</strong>
              <div className={styles.options__badges}>
                {Object.entries(product.options as Record<string, any>).map(([key, value]) => {
                  if (!value || !String(value).trim()) return null;

                  const optionLabels: Record<string, string> = {
                    color: 'Колір',
                    size: 'Розмір',
                    material: 'Матеріал',
                    brand: 'Бренд',
                    taste: 'Смак',
                    origin: 'Походження',
                  };

                  const label = optionLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                  return (
                    <Badge key={key} variant="outline" color="red" size="md">
                      {label}: {String(value)}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {isInStock ? (
            <div className={styles.info__availability}>В наявності: {availableQuantity} шт.</div>
          ) : (
            <div className={styles.info__availability}>Немає в наявності</div>
          )}

          {/* Кількість та кошик */}
          <div className={styles.actions}>
            <div className={styles.quantitySelector}>
              <Button
                size="sm"
                className={styles.quantitySelector__button}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}>
                −
              </Button>
              <input
                type="number"
                className={styles.quantitySelector__input}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                min="1"
                max={availableQuantity}
              />
              <Button
                size="sm"
                className={styles.quantitySelector__button}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableQuantity}>
                +
              </Button>
            </div>

            <Button
              className={`${styles.addToCartButton} ${!isInStock ? styles.addToCartButton__disabled : ''} ${
                isClicked ? styles.addToCartButton__success : ''
              }`}
              size="lg"
              onClick={handleAddToCart}
              disabled={!isInStock}>
              {getButtonText()}
            </Button>
          </div>

          {/* Кнопка переходу на повну сторінку */}
          <Link href={`/catalog/${product.slug}`} className={styles.fullDetailsLink} onClick={onClose}>
            <Button variant="outline" fullWidth>
              Переглянути повністю
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};

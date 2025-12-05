// src/features/cart/components/CartItem.tsx

'use client';
import { Group, Text, ActionIcon, NumberInput, Stack, Badge, Box } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { IconTrash } from '@/shared/components/Svg';
import { useState, useCallback, memo } from 'react';
import { CartItemWithProduct, formatPrice } from '@/shared/utils/cart-calculations';
import { useCart } from '../../hooks/useCart';
import Link from 'next/link';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import { useDebounce } from '@/shared/hooks';
import styles from './CartItem.module.scss';

interface CartItemProps {
  item: CartItemWithProduct;
  compact?: boolean;
  isFirst?: boolean;
}

const CartItemComponent = ({ item, compact = false, isFirst = false }: CartItemProps) => {
  const { updateItemQuantity, removeItem, isUpdatingItem, isRemovingItem } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const maxAvailable = item.variant?.availableQuantity ?? item.product.availableQuantity ?? 0;
  const isMaxReached = quantity >= maxAvailable;

  // Debounced API call for quantity update
  const debouncedUpdateQuantity = useDebounce((itemId: string, newQuantity: number) => {
    updateItemQuantity(itemId, newQuantity);
  }, 500);

  // Локальне оновлення кількості з debounce
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) return;
      setQuantity(newQuantity);
      debouncedUpdateQuantity(item.id, newQuantity);
    },
    [item.id, debouncedUpdateQuantity]
  );

  const handleRemove = useCallback(() => {
    removeItem(item.id);
  }, [item.id, removeItem]);

  const displayPrice = item.finalPrice;
  const originalPrice = item.hasPromo ? item.originalPrice : null;
  const imageUrl = item.product.primaryImage?.url;

  if (compact) {
    return (
      <Group gap="sm" align="flex-start" className={styles.wrapperMini}>
        {/* Зображення */}
        <CloudinaryImage
          src={imageUrl || '/assets/img/placeholder-product.jpg'}
          alt={item.product.name}
          width={160}
          height={160}
          className={`${styles.image} `}
        />

        {/* Інформація про товар */}
        <Stack gap={4} flex={1} className={styles.info}>
          {/* Рядок 1: Назва (зліва) | Ціна (справа) */}
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Text className={styles.productName} lineClamp={2} flex={1}>
              {item.variant?.name || item.product.name}
            </Text>

            <Box className={styles.priceContainer}>
              {originalPrice && (
                <Text className={styles.oldPrice}>{formatPrice(originalPrice * quantity)}</Text>
              )}
              <Text className={styles.currentPrice} c={originalPrice ? 'red' : undefined}>
                {formatPrice(displayPrice * quantity)}
              </Text>
            </Box>
          </Group>

          {/* Рядок 2: Опції товару */}
          {(() => {
            const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);

            if (badges.length === 0) return null;

            return (
              <Group gap={4}>
                {badges.map((badge) => (
                  <Text key={badge.key} className={styles.variantText}>
                    <span>{badge.label}:</span>
                    {badge.value}
                  </Text>
                ))}

              </Group>
            );
          })()}


          {/* Рядок 3: Контрол кількості (зліва) | Видалення (справа) */}
          <Group justify="space-between" align="center" className={styles.bottomControls}>
            <div className={styles.quantityControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdatingItem}>
                <IconMinus size={16} />
              </button>

              <div className={styles.qtyValue}>{quantity}</div>

              <button
                className={styles.qtyBtn}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdatingItem || isMaxReached}>
                <IconPlus size={16} />
              </button>
            </div>

            <Group gap="xs" onClick={handleRemove} style={{ cursor: 'pointer' }}>
              <ActionIcon className={styles.trashBtn} loading={isRemovingItem}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </Group>
    );
  }

  // Повний вигляд для сторінки кошика (compact=false)
  return (
    <Group align="flex-start" className={`${styles.wrapper} ${isFirst ? styles.wrapperFirst : ''}`}>
      {/* Зображення */}
      <CloudinaryImage
        src={imageUrl || '/assets/img/placeholder-product.jpg'}
        alt={item.product.name}
        width={260}
        height={260}
        className={styles.image}
      />

      {/* Інформація про товар */}
      <Stack gap={4} flex={1} className={styles.info}>
        {/* Рядок 1: Назва (зліва) | Ціна (справа) */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text className={styles.productName} lineClamp={2} flex={1}>
            {item.variant?.name || item.product.name}
          </Text>

          <Box className={styles.priceContainer}>
            {originalPrice && (
              <Text className={styles.oldPrice}>{formatPrice(originalPrice * quantity)}</Text>
            )}
            <Text className={styles.currentPrice} c={originalPrice ? 'red' : undefined}>
              {formatPrice(displayPrice * quantity)}
            </Text>
          </Box>
        </Group>

        {/* Рядок 2: Опції товару */}
        {(() => {
          const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);

          if (badges.length === 0) return null;

          return (
            <Group gap={4} className={styles.GroupVariantText}>
              {badges.map((badge) => (
                <Text key={badge.key} className={styles.variantText}>
                  <span>{badge.label}:</span>
                  {badge.value}
                </Text>
              ))}

            </Group>
          );
        })()}

        <Text className={styles.variantText}> <span>Ціна:</span> {formatPrice(displayPrice)}</Text>

        {/* Рядок 3: Контрол кількості (зліва) | Видалення (справа) */}
        <Group justify="space-between" align="center" className={styles.bottomControlsFull}>
          <div className={styles.quantityControl}>
            <button
              className={styles.qtyBtn}
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdatingItem}>
              <IconMinus size={16} />
            </button>

            <div className={styles.qtyValue}>{quantity}</div>

            <button
              className={styles.qtyBtn}
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdatingItem || isMaxReached}>
              <IconPlus size={16} />
            </button>
          </div>

          <Group gap="xs" onClick={handleRemove} style={{ cursor: 'pointer' }}>
            <ActionIcon className={styles.trashBtn} loading={isRemovingItem}>
              <IconTrash size={16} />
            </ActionIcon>
            <Text className={styles.deleteText}>Видалити</Text>

          </Group>
        </Group>
      </Stack>
    </Group>
  );
};

export const CartItem = memo(CartItemComponent);

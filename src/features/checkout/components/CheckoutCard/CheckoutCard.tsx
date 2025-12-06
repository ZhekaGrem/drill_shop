'use client';

import { Group, Text, Stack, Box } from '@mantine/core';
import { CartItemWithProduct, formatPrice } from '@/shared/utils/cart-calculations';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import { memo } from 'react';
import styles from './CheckoutCard.module.scss';

interface CheckoutCardProps {
  item: CartItemWithProduct;
}

const CheckoutCardComponent = ({ item }: CheckoutCardProps) => {
  const displayPrice = item.finalPrice;
  const originalPrice = item.hasPromo ? item.originalPrice : null;
  const imageUrl = item.product.primaryImage?.url;

  return (
    <Group gap="sm" align="flex-start" className={styles.wrapper}>
      {/* Зображення */}
      <CloudinaryImage
        src={imageUrl || '/assets/img/placeholder-product.jpg'}
        alt={item.product.name}
        width={80}
        height={80}
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
              <Text className={styles.oldPrice}>{formatPrice(originalPrice * item.quantity)}</Text>
            )}
            <Text className={styles.currentPrice} c={originalPrice ? 'red' : undefined}>
              {formatPrice(displayPrice * item.quantity)}
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

        {/* Рядок 3: Кількість (тільки відображення) */}
        <Text className={styles.quantity}>Кількість: {item.quantity}</Text>
      </Stack>
    </Group>
  );
};

export const CheckoutCard = memo(CheckoutCardComponent);

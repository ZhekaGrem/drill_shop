'use client';

import { Group, Text, ActionIcon, Stack, Box } from '@mantine/core';
import { IconTrash } from '@/shared/components/Svg';
import { memo } from 'react';
import { formatPrice } from '@/shared/utils/format';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { Product } from '@/shared/types';
import { Button } from '@/shared/components/Button/Button';
import styles from './FavoriteItem.module.scss';

interface FavoriteItemProps {
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
  isFirst?: boolean;
  isAddingToCart?: boolean;
}

const FavoriteItemComponent = ({
  product,
  onRemove,
  onAddToCart,
  isFirst = false,
  isAddingToCart = false,
}: FavoriteItemProps) => {
  const imageUrl = product.primaryImage?.url;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <Group align="flex-start" className={`${styles.wrapper} `}>
      {/* Зображення */}
      <CloudinaryImage
        src={imageUrl || '/assets/img/placeholder-product.jpg'}
        alt={product.name}
        width={260}
        height={260}
        className={styles.image}
      />

      {/* Інформація про товар */}
      <Stack gap={4} flex={1} className={styles.info}>
        {/* Рядок 1: Назва (зліва) | Ціна (справа) */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text className={styles.productName} lineClamp={2} flex={1}>
            {product.name}
          </Text>

          <Box className={styles.priceContainer}>
            {hasDiscount && <Text className={styles.oldPrice}>{formatPrice(product.comparePrice!)}</Text>}
            <Text className={styles.currentPrice} c={hasDiscount ? 'red' : undefined}>
              {formatPrice(product.price)}
            </Text>
          </Box>
        </Group>

        {/* Статус наявності */}
        <Text className={styles.variantText}>
          <span>Статус:</span> {product.isInStock ? 'В наявності' : 'Немає в наявності'}
        </Text>

        {/* Рядок 3: Додати в кошик (зліва) | Видалення (справа) */}
        <Group justify="space-between" align="center" className={styles.bottomControls}>
          <Button
            onClick={onAddToCart}
            disabled={!product.isInStock || isAddingToCart}
            loading={isAddingToCart}>
            {product.isInStock ? 'Додати в кошик' : 'Немає в наявності'}
          </Button>

          <Group gap="xs" onClick={onRemove} style={{ cursor: 'pointer' }}>
            <ActionIcon className={styles.trashBtn}>
              <IconTrash size={16} />
            </ActionIcon>
            <Text className={styles.deleteText}>Видалити</Text>
          </Group>
        </Group>
      </Stack>
    </Group>
  );
};

export const FavoriteItem = memo(FavoriteItemComponent);

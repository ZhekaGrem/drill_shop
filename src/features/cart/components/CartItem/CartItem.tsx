// src/features/cart/components/CartItem.tsx

'use client';
import { Group, Text, ActionIcon, NumberInput, Stack, Badge, Box } from '@mantine/core';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
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
}

const CartItemComponent = ({ item, compact = false }: CartItemProps) => {
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
      <Group gap="sm" align="flex-start" className={styles.wrapper}>
        {/* Зображення */}
        <CloudinaryImage
          src={imageUrl || '/assets/img/placeholder-product.jpg'}
          alt={item.product.name}
          width={160}
          height={160}
          className={styles.image}
        />

        {/* Інформація про товар */}
        <Stack gap={4} flex={1} className={styles.info}>
          <Text size="sm" fw={500} lineClamp={2}>
            {item.variant?.name || item.product.name}
          </Text>

          {(() => {
            const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);

            if (badges.length === 0) return null;

            return (
              <Group gap={4}>
                {badges.map((badge) => (
                  <Badge key={badge.key} size="xs" variant="transparent" color="green">
                    {badge.label}: {badge.value}
                  </Badge>
                ))}
              </Group>
            );
          })()}

          <Group justify="space-between">
            <Group gap="xs">
              <ActionIcon
                size="sm"
                variant="light"
                color="gray"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdatingItem}>
                <IconMinus size={14} />
              </ActionIcon>

              <Text size="sm" w={30} ta="center">
                {quantity}
              </Text>

              <ActionIcon
                size="sm"
                variant="light"
                color="gray"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdatingItem || isMaxReached}>
                <IconPlus size={14} />
              </ActionIcon>
            </Group>

            <ActionIcon size="sm" color="red" variant="light" onClick={handleRemove} loading={isRemovingItem}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>

          <Text size="sm" fw={500}>
            {originalPrice && (
              <Text span size="xs" td="line-through" c="dimmed" mr={4}>
                {formatPrice(originalPrice * quantity)}
              </Text>
            )}
            {formatPrice(displayPrice * quantity)}
          </Text>
        </Stack>
      </Group>
    );
  }

  // Повний вигляд для сторінки кошика
  return (
    <Box p="md" >
      <Group gap="md" align="flex-start">
        {/* Зображення */}
        <CloudinaryImage
          src={imageUrl || '/assets/img/placeholder-product.jpg'}
          alt={item.product.name}
          width={250}
          height={250}
        />

        {/* Інформація про товар */}
        <Stack gap="sm" flex={1}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text
                component={Link}
                href={`/catalog/${item.product.slug}`}
                fw={500}
                style={{ textDecoration: 'none', color: 'inherit' }}
                className="hover:underline">
                {item.variant?.name || item.product.name}
              </Text>

              {(() => {
                const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);

                if (badges.length === 0) return null;

                return (
                  <Group gap={6}>
                    {badges.map((badge) => (
                      <Badge key={badge.key} variant="transparent" color="green">
                        {badge.label}: {badge.value}
                      </Badge>
                    ))}
                  </Group>
                );
              })()}

              {item.product.unitValue && (
                <Text size="sm" c="dimmed">
                  Вага: {item.product.unitValue} кг
                </Text>
              )}
            </Stack>

            <ActionIcon color="red" variant="light" onClick={handleRemove} loading={isRemovingItem}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>

          {/* Ціна та кількість */}
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Ціна за одиницю:
              </Text>
              {originalPrice && (
                <Text size="sm" td="line-through" c="dimmed">
                  {formatPrice(originalPrice)}
                </Text>
              )}
              <Text fw={500}>{formatPrice(displayPrice)}</Text>
            </Group>

            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Кількість:
              </Text>
              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdatingItem}>
                  <IconMinus size={16} />
                </ActionIcon>

                <NumberInput
                  value={quantity}
                  onChange={(value) => {
                    const numValue = typeof value === 'string' ? parseInt(value) : value;
                    if (numValue && numValue > 0) {
                      handleQuantityChange(numValue);
                    }
                  }}
                  min={1}
                  max={maxAvailable}
                  w={80}
                  disabled={isUpdatingItem}
                />

                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isUpdatingItem || isMaxReached}>
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>
            </Group>

            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Сума:
              </Text>

              <Text fw={700} size="lg">
                {formatPrice(displayPrice * quantity)}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Group>
    </Box>
  );
};

export const CartItem = memo(CartItemComponent);

// src/features/catalog/components/ProductCard/ProductCardActions.tsx
import React from 'react';
import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import { Group } from '@mantine/core';
import styles from './ProductCard.module.scss';

interface ProductCardActionsProps {
  isClicked: boolean;
  isInStock: boolean;
  buttonText: string;
  onAddToCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Компонент дій ProductCard
 * Відображає кнопку додавання в кошик
 */
export const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  isClicked,
  isInStock,
  buttonText,
  onAddToCart,
}) => {
  return (
    <div className={styles.actions}>
      <Button
        disabled={isClicked || !isInStock}
        onClick={onAddToCart}
        type="button"
        fullWidth
        variant="secondary"
        className={styles.addButton}>
        <Group gap={10}>
          <IconCart3 /> <p className={styles.buttonText}> {buttonText} </p>
        </Group>
      </Button>
    </div>
  );
};

import { Box } from '@mantine/core';
import { formatPrice } from '@/shared/utils/format';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface PriceDisplayProps {
  product: any;
  selectedVariant: any;
  unitDisplay?: string;
  currentWeight?: number | null;
}

export const PriceDisplay = ({ product, selectedVariant, unitDisplay, currentWeight }: PriceDisplayProps) => {
  const basePromoData = product ? calculatePromoPrice(product) : null;

  return (
    <div className={styles.productDetails__price}>
      {selectedVariant ? (
        // Показуємо ціну обраного варіанту з акцією (якщо є)
        (() => {
          const variantPriceData = calculateVariantPromoPrice(selectedVariant);
          if (variantPriceData.hasDiscount) {
            return (
              <>
                <Box
                  component="span"
                  className={styles.productDetails__originalPrice}
                  mr={8}
                  style={{ textDecoration: 'line-through', color: '#999' }}>
                  {formatPrice(variantPriceData.originalPrice)}
                </Box>
                <span
                  className={`${styles.productDetails__currentPrice} ${styles.productDetails__currentPrice_discount}`}>
                  {formatPrice(variantPriceData.finalPrice)}
                </span>
              </>
            );
          }
          return <span className={styles.productDetails__currentPrice}>{formatPrice(selectedVariant.price)}</span>;
        })()
      ) : basePromoData?.hasDiscount ? (
        // Показуємо знижену ціну (як в ProductCard)
        <>
          <Box
            component="span"
            className={styles.productDetails__originalPrice}
            mr={8}
            style={{ textDecoration: 'line-through', color: '#999' }}>
            {formatPrice(basePromoData.originalPrice)}
          </Box>
          <span className={`${styles.productDetails__currentPrice} ${styles.productDetails__currentPrice_discount}`}>
            {formatPrice(basePromoData.finalPrice)}
          </span>
        </>
      ) : (
        // Показуємо звичайну ціну
        <span className={styles.productDetails__currentPrice}>{formatPrice(product?.price)}</span>
      )}
      {currentWeight && <span className={styles.productDetails__pricePerKg}> / {currentWeight}</span>}{' '}
      {unitDisplay}
    </div>
  );
};

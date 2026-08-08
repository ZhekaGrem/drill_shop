import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface ProductActionsProps {
  isInStock: boolean;
  quantity: number;
  availableQuantity: number;
  hasSizeGuide: boolean;
  isClicked: boolean;
  buttonText: string;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onOpenSizeGuide: () => void;
  onOpenNotifyModal: () => void;
}

export const ProductActions = ({
  isInStock,
  quantity,
  availableQuantity,
  hasSizeGuide,
  isClicked,
  buttonText,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide,
  onOpenNotifyModal,
}: ProductActionsProps) => {
  return (
    <div className={styles.productDetails__actions}>
      {isInStock ? (
        <div className={styles.actionButtons}>
          <div className={styles.actionButtonsWrapper}>
            <div className={styles.quantitySelector}>
              <button
                className={styles.quantitySelector__button}
                onClick={() => onQuantityChange(quantity - 1)}
                disabled={quantity <= 1}>
                −
              </button>
              <input
                type="number"
                className={styles.quantitySelector__input}
                value={quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                min="1"
                max={availableQuantity}
              />
              <button
                className={styles.quantitySelector__button}
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={quantity >= availableQuantity}>
                +
              </button>
            </div>
            {hasSizeGuide && (
              <Button
                variant="outline"
                onClick={onOpenSizeGuide}
                className={styles.sizeGuideButton}
                aria-label="Таблиця розмірів">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h18M3 8v8a1 1 0 001 1h16a1 1 0 001-1V8M3 8l2-4h14l2 4M7 8v3M11 8v5M15 8v3M19 8v5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Розміри
              </Button>
            )}
          </div>
          <Button variant="secondary" size="lg" className={styles.buyNowButton} onClick={onAddToCart}>
            <IconCart3 /> {buttonText}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className={`${styles.addToCartButton} ${isClicked ? styles.addToCartButton__success : ''}`}
            onClick={onBuyNow}>
            Купити зараз
          </Button>
        </div>
      ) : (
        <div className={styles.actionButtons}>
          <Button variant="primary" size="lg" fullWidth onClick={onOpenNotifyModal}>
            Сповістити мене про появу товару
          </Button>
        </div>
      )}
    </div>
  );
};

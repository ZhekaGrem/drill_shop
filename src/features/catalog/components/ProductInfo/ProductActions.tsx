import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import Image from 'next/image';
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
              <Button variant="ghost" onClick={onOpenSizeGuide} p={0}>
                <Image src="/assets/img/btnInfo.jpg" width={50} height={50} alt="btninfo" />
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
            КУПИТИ ЗАРАЗ
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

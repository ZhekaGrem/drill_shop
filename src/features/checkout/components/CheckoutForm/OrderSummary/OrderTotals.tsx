import { formatPrice } from '@/shared/utils/format';
import styles from '../CheckoutForm.module.scss';

interface OrderTotalsProps {
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
    name?: string;
  } | null;
}

export const OrderTotals = ({ subtotal, discount }: OrderTotalsProps) => {
  const total = discount ? Math.max(0, subtotal - discount.amount) : subtotal;

  return (
    <>
      {/* Discount section */}
      {discount && (
        <>
          <div className={styles.divider} />
          <div className={styles.discountSection}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Підсумок</span>
              <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.discountInfo}>
                <span className={styles.discountCode}>Промокод: {discount.code}</span>
                {discount.name && <span className={styles.discountName}>{discount.name}</span>}
              </div>
              <span className={styles.discountAmount}>-{formatPrice(discount.amount)}</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.divider} />

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Доставка</span>
        <span className={styles.summaryValue}>За тарифами перевізника</span>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Загалом</span>
        <span className={styles.totalAmount}>{formatPrice(total)}</span>
      </div>
    </>
  );
};

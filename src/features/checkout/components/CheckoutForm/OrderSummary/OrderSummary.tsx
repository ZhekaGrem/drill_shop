import { Checkbox } from '@mantine/core';
import { UseFormReturn } from 'react-hook-form';
import Link from 'next/link';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { PromoCodeInput } from '../../PromoCodeInput/PromoCodeInput';
import { CartItemsList } from './CartItemsList';
import { OrderTotals } from './OrderTotals';
import styles from '../CheckoutForm.module.scss';

interface OrderSummaryProps {
  items: any[];
  totalAmount: number;
  appliedDiscount: {
    code: string;
    amount: number;
    id: string;
    name: string;
  } | null;
  doNotCall: boolean;
  isSubmitting: boolean;
  isCartLoading: boolean;
  onApplyDiscount: (discountData: any) => void;
  onRemoveDiscount: () => void;
  onDoNotCallChange: (value: boolean) => void;
  form: UseFormReturn<any>;
}

export const OrderSummary = ({
  items,
  totalAmount,
  appliedDiscount,
  doNotCall,
  isSubmitting,
  isCartLoading,
  onApplyDiscount,
  onRemoveDiscount,
  onDoNotCallChange,
}: OrderSummaryProps) => {
  return (
    <div className={styles.orderSummary}>
      <h3 className={styles.summaryTitle}>ВАШЕ ЗАМОВЛЕННЯ</h3>

      <CartItemsList items={items} />

      <div className={styles.promoSection}>
        <PromoCodeInput
          orderAmount={totalAmount}
          onApply={onApplyDiscount}
          onRemove={onRemoveDiscount}
          appliedCode={appliedDiscount?.code}
          disabled={isSubmitting}
        />
      </div>

      <OrderTotals subtotal={totalAmount} discount={appliedDiscount} />

      <Checkbox
        label="Не дзвонити для уточнення"
        checked={doNotCall}
        onChange={(e) => onDoNotCallChange(e.currentTarget.checked)}
        className={styles.btnConfirmPhone}
        radius={0}
        styles={{
          root: { padding: 'var(--spacing-sm) var(--spacing-md)' },
          label: { fontFamily: 'var(--font-condensed)', fontSize: 'var(--text-sm)' },
        }}
      />

      <Button
        type="submit"
        size="sm"
        variant="primary"
        fullWidth
        className={styles.btnConfirmPhone}
        loading={isSubmitting}
        disabled={isCartLoading || items.length === 0}>
        {isSubmitting ? 'Створення замовлення...' : 'Підтвердити замовлення'}
      </Button>

      <div className={styles.agreementNoticePhone}>
        <IconAlertCircle size={20} />
        <p className={styles.agreementText}>
          Натискаючи "Підтвердити замовлення", ви погоджуєтесь з умовами{' '}
          <Link href="/public-offer" className={styles.agreementLink}>
            публічної оферти
          </Link>{' '}
          та{' '}
          <Link href="/privacy-policy" className={styles.agreementLink}>
            політики конфіденційності
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

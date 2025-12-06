// src/app/checkout/Checkout.tsx
'use client';

import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';
import styles from './checkout.module.scss';

const CheckoutPage = () => {
  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <CheckoutForm />
      </div>
    </div>
  );
};

export default CheckoutPage;

// src/app/checkout/Checkout.tsx
'use client';

import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';
import styles from './checkout.module.scss';

const CheckoutPage = () => {
  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>ОФОРМЛЕННЯ ЗАМОВЛЕННЯ</h1>
        <CheckoutForm />
      </div>
    </div>
  );
};

export default CheckoutPage;

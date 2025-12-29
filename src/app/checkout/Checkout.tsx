// src/app/checkout/Checkout.tsx
'use client';

import { Container } from '@mantine/core';
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';
import styles from './checkout.module.scss';

const CheckoutPage = () => {
  return (
    <div className={styles.checkoutPage}>
      <Container size={1200}>
        <CheckoutForm />
      </Container>
    </div>
  );
};

export default CheckoutPage;

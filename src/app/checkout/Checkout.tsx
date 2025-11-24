// src/pages/Checkout/Checkout.tsx
'use client';

import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';
import { Container, Title } from '@mantine/core';

const CheckoutPage = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center">
        Оформлення замовлення
      </Title>
      <CheckoutForm />
    </Container>
  );
};

export default CheckoutPage;

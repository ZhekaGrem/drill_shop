'use client';

import { Container, Title } from '@mantine/core';
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';

export default function TelegramCheckoutPage() {
  return (
    <Container size="lg" p="md">
      <Title order={2} mb="md">
        Оформлення замовлення
      </Title>
      <CheckoutForm email={false} />
    </Container>
  );
}

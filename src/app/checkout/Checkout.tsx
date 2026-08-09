// src/app/checkout/Checkout.tsx
'use client';

import { CheckoutForm } from '@/features/checkout/components/CheckoutForm/CheckoutForm';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

const CheckoutPage = () => {
  return (
    <Page>
      <PageHeader
        title="Оформлення замовлення"
        description="Заповніть дані отримувача, оберіть доставку й спосіб оплати."
      />
      <CheckoutForm />
    </Page>
  );
};

export default CheckoutPage;

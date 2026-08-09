// src/app/checkout/failed/CheckoutFailed.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const ERROR_MESSAGES: Record<string, string> = {
  CART_EMPTY: 'Ваш кошик порожній',
  INVENTORY_ERROR: 'Деякі товари закінчилися на складі',
  PAYMENT_ERROR: 'Помилка обробки оплати',
  VALIDATION_ERROR: 'Некоректні дані замовлення',
  SERVER_ERROR: 'Тимчасова технічна помилка',
};

const CheckoutFailedPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const orderNumber = searchParams.get('orderNumber');

  const message = (error && ERROR_MESSAGES[error]) || error || 'Невідома помилка при оформленні замовлення';

  return (
    <StatusPage
      tone="error"
      icon={<IconAlertTriangle stroke={1.5} />}
      eyebrow="Замовлення не створено"
      title={message}
      description="Перевірте правильність заповнення полів і наявність товарів, потім спробуйте ще раз."
      actions={
        <>
          <Link href="/checkout">
            <Button variant="primary">Спробувати знову</Button>
          </Link>
          <Link href="/cart">
            <Button variant="secondary">Повернутись до кошика</Button>
          </Link>
        </>
      }>
      <ListGroup>
        {orderNumber && <ListRow title="Номер замовлення" value={orderNumber} />}
        {error && <ListRow title="Код помилки" value={error} />}
        <ListRow href="/contact" title="Служба підтримки" hint="Напишіть нам, якщо помилка повторюється" />
      </ListGroup>
    </StatusPage>
  );
};

export default CheckoutFailedPage;

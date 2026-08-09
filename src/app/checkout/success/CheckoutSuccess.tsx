// src/app/checkout/success/CheckoutSuccess.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader, Center } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  if (!orderId || !orderNumber) {
    return (
      <Center h={240}>
        <Loader />
      </Center>
    );
  }

  return (
    <StatusPage
      tone="success"
      icon={<IconCircleCheck stroke={1.5} />}
      eyebrow="Замовлення прийнято"
      title="Дякуємо за покупку!"
      description="Ми вже почали обробляти замовлення. Найближчим часом менеджер звʼяжеться з вами для підтвердження."
      actions={
        <>
          <Link href={`/orders/track/${orderNumber}`}>
            <Button variant="primary">Відстежити замовлення</Button>
          </Link>
          <Link href="/catalog">
            <Button variant="secondary">Продовжити покупки</Button>
          </Link>
        </>
      }>
      <ListGroup>
        <ListRow title="Номер замовлення" value={orderNumber} />
        <ListRow
          href="/profile/orders"
          title="Статус у кабінеті"
          hint="Історія замовлень і поточний статус"
        />
      </ListGroup>
    </StatusPage>
  );
};

export default CheckoutSuccessPage;

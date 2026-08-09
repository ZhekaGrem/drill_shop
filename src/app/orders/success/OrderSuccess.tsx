'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { IconCircleCheck } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const OrderSuccess = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const customerEmail = searchParams.get('email');
  const totalAmount = searchParams.get('total');
  const displayNumber = orderNumber || orderId;

  return (
    <StatusPage
      tone="success"
      icon={<IconCircleCheck stroke={1.5} />}
      eyebrow="Замовлення оформлено"
      title="Дякуємо за замовлення!"
      description="Ми надіслали підтвердження на пошту. Менеджер звʼяжеться з вами найближчим часом."
      actions={
        <>
          {displayNumber && (
            <Link href={`/orders/track/${displayNumber}`}>
              <Button variant="primary">Відстежити замовлення</Button>
            </Link>
          )}
          <Link href="/catalog">
            <Button variant="secondary">Продовжити покупки</Button>
          </Link>
        </>
      }>
      <ListGroup>
        <ListRow title="Номер замовлення" value={displayNumber || '—'} />
        {totalAmount && <ListRow title="Сума" value={`${totalAmount} ₴`} />}
        {customerEmail && <ListRow title="Email" value={customerEmail} />}
      </ListGroup>
    </StatusPage>
  );
};

export default OrderSuccess;

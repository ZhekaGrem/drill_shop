// src/app/checkout/success/CheckoutSuccess.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const CheckoutSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  // Номер замовлення читабельніший за id — показуємо його, якщо є, а orderId
  // лишаємо як запасний варіант. Раніше сторінка вимагала обидва параметри
  // одразу й крутила спінер без тексту й без таймауту, якщо один не долетів.
  const displayNumber = orderNumber || orderId;

  if (!displayNumber) {
    return (
      <StatusPage
        tone="error"
        icon={<IconAlertCircle stroke={1.5} />}
        title="Не вдалося визначити замовлення"
        description="Посилання пошкоджене або застаріле. Перевірте статус у кабінеті."
        actions={
          <Link href="/profile/orders">
            <Button variant="primary">До моїх замовлень</Button>
          </Link>
        }
      />
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
          <Link href={`/orders/track/${displayNumber}`}>
            <Button variant="primary">Відстежити замовлення</Button>
          </Link>
          <Link href="/catalog">
            <Button variant="secondary">Продовжити покупки</Button>
          </Link>
        </>
      }>
      <ListGroup>
        <ListRow title="Номер замовлення" value={displayNumber} />
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

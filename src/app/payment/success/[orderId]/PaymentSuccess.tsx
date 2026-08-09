// src/app/payment/success/[orderId]/PaymentSuccess.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconClock } from '@tabler/icons-react';
import { usePaymentStatus } from '@/features/payment/hooks/usePayment';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const REDIRECT_DELAY_MS = 3000;

const PaymentSuccessPage = () => {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.orderId as string;
  const [isVerifying, setIsVerifying] = useState(true);

  const { data: paymentData, isLoading, error } = usePaymentStatus(orderId, !!orderId);

  useEffect(() => {
    if (paymentData && !isLoading) {
      setIsVerifying(false);

      const timeout = setTimeout(() => {
        const trackingId = paymentData.orderNumber || orderId;
        router.push(trackingId ? `/orders/track/${trackingId}` : '/');
      }, REDIRECT_DELAY_MS);

      return () => clearTimeout(timeout);
    }
  }, [paymentData, isLoading, orderId, router]);

  if (!orderId) {
    return (
      <StatusPage
        tone="error"
        icon={<IconAlertCircle stroke={1.5} />}
        title="Невірний ідентифікатор замовлення"
        description="Посилання пошкоджене або застаріле."
        actions={
          <Link href="/">
            <Button variant="primary">На головну</Button>
          </Link>
        }
      />
    );
  }

  if (isLoading || isVerifying) {
    return (
      <StatusPage
        icon={<Loader size="sm" />}
        eyebrow="Зачекайте"
        title="Перевіряємо статус оплати"
        description="Це займає кілька секунд — не закривайте сторінку."
      />
    );
  }

  if (error || !paymentData) {
    return (
      <StatusPage
        tone="error"
        icon={<IconAlertCircle stroke={1.5} />}
        title="Не вдалося перевірити платіж"
        description="Спробуйте оновити сторінку. Якщо кошти списано, а статус не змінився — напишіть у підтримку."
        actions={
          <>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Спробувати знову
            </Button>
            <Link href="/contact">
              <Button variant="secondary">Підтримка</Button>
            </Link>
          </>
        }
      />
    );
  }

  const orderRef = paymentData.orderNumber || orderId;
  const isSuccess = paymentData.status === 'PAID';
  const isPending = paymentData.status === 'PENDING';

  if (isPending) {
    return (
      <StatusPage
        icon={<IconClock stroke={1.5} />}
        eyebrow="Оплата в обробці"
        title="Платіж ще обробляється"
        description="Щойно банк підтвердить оплату, статус замовлення оновиться автоматично."
        actions={
          <Link href={`/orders/track/${orderRef}`}>
            <Button variant="primary">Перейти до замовлення</Button>
          </Link>
        }>
        <ListGroup>
          <ListRow title="Номер замовлення" value={orderRef} />
        </ListGroup>
      </StatusPage>
    );
  }

  if (!isSuccess) {
    return (
      <StatusPage
        tone="error"
        icon={<IconAlertCircle stroke={1.5} />}
        eyebrow="Оплата не пройшла"
        title="Платіж не вдалося обробити"
        description="Спробуйте ще раз або оберіть інший спосіб оплати."
        actions={
          <>
            <Link href="/checkout">
              <Button variant="primary">Спробувати знову</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Підтримка</Button>
            </Link>
          </>
        }>
        <ListGroup>
          <ListRow title="Номер замовлення" value={orderRef} />
        </ListGroup>
      </StatusPage>
    );
  }

  return (
    <StatusPage
      tone="success"
      icon={<IconCircleCheck stroke={1.5} />}
      eyebrow="Оплачено"
      title="Оплата пройшла успішно"
      description="Підтвердження надіслано на пошту. Зараз перенаправимо вас на сторінку замовлення."
      actions={
        <>
          <Link href={`/orders/track/${orderRef}`}>
            <Button variant="primary">Переглянути замовлення</Button>
          </Link>
          <Link href="/catalog">
            <Button variant="secondary">До каталогу</Button>
          </Link>
        </>
      }>
      <ListGroup>
        <ListRow title="Номер замовлення" value={orderRef} />
      </ListGroup>
    </StatusPage>
  );
};

export default PaymentSuccessPage;

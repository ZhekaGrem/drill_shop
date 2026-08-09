// src/app/payment/failed/[orderId]/PaymentFailed.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IconAlertTriangle } from '@tabler/icons-react';
import { usePaymentStatus } from '@/features/payment/hooks/usePayment';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';

const ERROR_MESSAGES: Record<string, string> = {
  PAYMENT_DECLINED: 'Платіж відхилено банком. Перевірте дані карти або спробуйте іншу.',
  INSUFFICIENT_FUNDS: 'Недостатньо коштів на карті.',
  CARD_EXPIRED: 'Термін дії карти закінчився.',
  INVALID_CARD: 'Невірні дані карти.',
  LIMIT_EXCEEDED: 'Перевищено ліміт операцій.',
  TIMEOUT: 'Час очікування платежу вичерпано.',
  CANCELLED_BY_USER: 'Платіж скасовано.',
  TECHNICAL_ERROR: 'Технічна помилка платіжної системи.',
};

const PaymentFailedPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const orderId = params?.orderId as string;
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  const { data: paymentData } = usePaymentStatus(orderId, !!orderId);
  const trackingId = paymentData?.orderNumber || orderId;

  const message =
    reason ||
    (error && ERROR_MESSAGES[error]) ||
    'Не вдалося обробити платіж. Спробуйте ще раз або оберіть інший спосіб оплати.';

  return (
    <StatusPage
      tone="error"
      icon={<IconAlertTriangle stroke={1.5} />}
      eyebrow="Оплата не пройшла"
      title="Платіж не вдалося обробити"
      description={message}
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
        {trackingId && <ListRow title="Номер замовлення" value={trackingId} />}
        {error && <ListRow title="Код помилки" value={error} />}
        {trackingId && (
          <ListRow
            href={`/orders/track/${trackingId}`}
            title="Статус замовлення"
            hint="Замовлення збережено — оплатити можна повторно"
          />
        )}
      </ListGroup>
    </StatusPage>
  );
};

export default PaymentFailedPage;

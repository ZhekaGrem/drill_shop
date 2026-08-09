'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';

const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      tone="error"
      icon={<IconAlertTriangle stroke={1.5} />}
      eyebrow={error.digest ? `Код: ${error.digest}` : 'Помилка'}
      title="Щось пішло не так"
      description="Сталася непередбачена помилка. Спробуйте оновити сторінку — ми вже отримали сповіщення."
      actions={
        <>
          <Button variant="primary" onClick={reset}>
            Спробувати знову
          </Button>
          <Link href="/">
            <Button variant="secondary">На головну</Button>
          </Link>
        </>
      }
    />
  );
};

export default Error;

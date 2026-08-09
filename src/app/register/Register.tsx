// src/app/register/Register.tsx
'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/features/auth/components/RegisterForm/RegisterForm';
import { Page } from '@/shared/components/Page/Page';
import styles from './register.module.scss';

const Register = () => {
  const router = useRouter();

  return (
    <Page width="narrow" className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Реєстрація</h1>
        <p className={styles.description}>
          Акаунт зберігає історію замовлень і адреси доставки. Оформити замовлення можна й без нього.
        </p>
        <RegisterForm
          onSuccess={() => router.push('/verify-email')}
          onSwitchToLogin={() => router.push('/login')}
        />
      </div>
    </Page>
  );
};

export default Register;

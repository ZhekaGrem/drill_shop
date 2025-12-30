'use client';

import { useState } from 'react';
import { Alert } from '@mantine/core';
import { useAuthStore } from '@/shared/stores/auth';
import styles from './emailVerificationBanner.module.scss';

export const EmailVerificationBanner = () => {
  const { userProfile, isAuthenticated } = useAuthStore();
  const [isClosed, setIsClosed] = useState(false);

  // Показуємо тільки якщо:
  // 1. Користувач залогінений
  // 2. Email НЕ верифікований
  // 3. Banner НЕ закритий користувачем
  if (!isAuthenticated || !userProfile || userProfile.isVerified || isClosed) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Alert
        color="yellow"
        variant="default"
        title="Підтвердіть email"
        classNames={{
          root: styles.alert,
        }}
        withCloseButton
        onClose={() => setIsClosed(true)}>
        <p className={styles.alert__description}>
          Закінчить авторизацію. Перевірте пошту та натисніть на посилання для завершення реєстрації.
        </p>
      </Alert>
    </div>
  );
};

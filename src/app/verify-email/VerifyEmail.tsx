// src/app/verify-email/VerifyEmail.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Loader, ThemeIcon, Stack, Center } from '@mantine/core';
import { IconCheck, IconX, IconMail } from '@tabler/icons-react';
import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import styles from './verifyEmail.module.scss';

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const message = searchParams.get('message');

  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto-verify when component mounts with token
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerificationStatus('pending');

      const response = await apiClient.post(endpoints.auth.verifyEmail, {
        token: verificationToken,
      });

      if (response.data.success) {
        setVerificationStatus('success');
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('❌ Email verification error:', error);

      const errorMsg = error.response?.data?.message || error.message || 'Помилка підтвердження email';
      setErrorMessage(errorMsg);
      setVerificationStatus('error');
    }
  };

  // Display message from registration success
  if (message) {
    return (
      <Container size="xs" py="xl" className={styles.container}>
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="green" variant="light">
              <IconCheck size={40} />
            </ThemeIcon>
            <Title order={3}>{message}</Title>
            <Text ta="center" c="dimmed">
              Перевірте вашу пошту для підтвердження акаунта
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/catalog')} size="md">
              Перейти до входу
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // No token provided
  if (!token) {
    return (
      <Container size="xs" py="xl" className={styles.container}>
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="red" variant="light">
              <IconX size={40} />
            </ThemeIcon>
            <Title order={3}>Невірне посилання</Title>
            <Text ta="center" c="dimmed">
              Посилання для підтвердження невірне або пошкоджене
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/resend-verification')} variant="outline">
              Запросити нове посилання
            </Button>
            <Button fullWidth mt="sm" onClick={() => router.push('/catalog')} variant="subtle">
              Повернутись до входу
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl" className={styles.container}>
      <Paper radius="md" p="xl" withBorder className={styles.paper}>
        {verificationStatus === 'pending' && (
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Title order={3}>Перевіряємо email...</Title>
            <Text c="dimmed">Будь ласка, зачекайте</Text>
          </Stack>
        )}

        {verificationStatus === 'success' && (
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="green" variant="light">
              <IconCheck size={40} />
            </ThemeIcon>
            <Title order={3}>Email підтверджено!</Title>
            <Text ta="center" c="dimmed">
              Ваш email успішно підтверджено. Тепер ви можете користуватися всіма функціями сайту.
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/catalog')} size="md">
              Увійти в акаунт
            </Button>
          </Stack>
        )}

        {verificationStatus === 'error' && (
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="red" variant="light">
              <IconX size={40} />
            </ThemeIcon>
            <Title order={3}>Помилка підтвердження</Title>
            <Text ta="center" c="dimmed">
              {errorMessage || 'Посилання недійсне або застаріле'}
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/resend-verification')} variant="outline">
              Надіслати нове посилання
            </Button>
            <Button fullWidth mt="sm" onClick={() => router.push('/catalog')} variant="subtle">
              Повернутись до входу
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

const VerifyEmail = () => {
  return (
    <Suspense
      fallback={
        <Container size="xs" py="xl">
          <Paper radius="md" p="xl" withBorder>
            <Center>
              <Loader size="lg" />
            </Center>
          </Paper>
        </Container>
      }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;

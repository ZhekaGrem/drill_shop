// src/app/auth/reset-password/page.tsx - NEW FILE
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Text, Alert, PasswordInput, Stack } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { apiClient } from '@/shared/api/client';
import { notifications } from '@mantine/notifications';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Пароль повинен містити мінімум 8 символів')
      .regex(/^(?=.*[a-z])/, 'Пароль повинен містити малу літеру')
      .regex(/^(?=.*[A-Z])/, 'Пароль повинен містити велику літеру')
      .regex(/^(?=.*\d)/, 'Пароль повинен містити цифру'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Відсутній токен для скидання пароля');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        setStatus('success');
        notifications.show({
          title: 'Успішно!',
          message: 'Пароль змінено. Тепер ви можете увійти з новим паролем.',
          color: 'green',
        });

        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Помилка зміни пароля. Спробуйте ще раз.');

      notifications.show({
        title: 'Помилка',
        message: error.response?.data?.message || 'Не вдалося змінити пароль',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
        }}>
        <Container size="sm">
          <Paper p="xl" shadow="md" radius="md" style={{ textAlign: 'center' }}>
            <IconCheck size={64} color="green" style={{ margin: '0 auto 1rem' }} />
            <Text size="lg" mb="md" c="green" fw={600}>
              Пароль успішно змінено!
            </Text>
            <Text size="sm" c="dimmed">
              Перенаправляємо на сторінку входу...
            </Text>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
      }}>
      <Container size="sm">
        <Paper p="xl" shadow="md" radius="md">
          <Text size="xl" fw={700} mb="lg" ta="center">
            Скидання пароля
          </Text>

          {status === 'error' ? (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {errorMessage}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack gap="md">
                {errorMessage && (
                  <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {errorMessage}
                  </Alert>
                )}

                <PasswordInput
                  label="Новий пароль"
                  placeholder="Введіть новий пароль"
                  required
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                  description="Мінімум 8 символів, включаючи великі та малі літери, цифри"
                />

                <PasswordInput
                  label="Підтвердіть пароль"
                  placeholder="Введіть пароль ще раз"
                  required
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />

                <Button type="submit" fullWidth disabled={!token}>
                  Змінити пароль
                </Button>

                <Button variant="secondary" fullWidth onClick={() => router.push('/')}>
                  На головну
                </Button>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </div>
  );
}

'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Stack, Alert, Text, Anchor } from '@mantine/core';
import { IconAlertCircle, IconMailCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { apiClient } from '@/shared/api/client';
import { useRouter } from 'next/navigation';
const resetSchema = z.object({
  email: z.string().email('Неправильний формат email'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const PasswordResetForm = ({ onSuccess, onBackToLogin }: PasswordResetFormProps) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const emailValue = watch('email');

  const onSubmit: SubmitHandler<ResetFormValues> = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 3000);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailValue) {
      setErrorMessage('Спочатку введіть email');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/auth/resend-verification', {
        email: emailValue,
      });

      if (response.data.success) {
        setIsSuccess(true);
        setErrorMessage(null);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Помилка відправки листа');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Stack gap="md">
        <Alert color="green" icon={<IconMailCheck size={16} />}>
          <Text fw={500}>Лист надіслано!</Text>
          <Text size="sm" mt="xs">
            Перевірте вашу пошту. Якщо email існує, ви отримаєте інструкції для відновлення пароля.
          </Text>
        </Alert>
        <Button fullWidth onClick={onBackToLogin}>
          Повернутися до входу
        </Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{
      minHeight: '100vh',
    }}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Введіть email, пов'язаний з вашим акаунтом, і ми надішлемо вам інструкції для відновлення пароля.
        </Text>

        {errorMessage && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {errorMessage}
          </Alert>
        )}

        <TextInput
          label="Email"
          placeholder="your@email.com"
          type="email"
          required
          disabled={isLoading}
          {...register('email')}
          error={errors.email?.message}
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          Надіслати інструкції
        </Button>

        {/* ДОДАНО: Посилання на resend verification */}
        {/* <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Text size="sm" c="dimmed">
            Не отримали лист підтвердження?{' '}
            <Button
              type="button"
              size="sm"
              onClick={handleResendVerification}
              disabled={isLoading || !emailValue}
              style={{ fontWeight: 600 }}>
              Надіслати ще раз
            </Button>
          </Text>
        </div> */}
      </Stack>
    </form>
  );
};

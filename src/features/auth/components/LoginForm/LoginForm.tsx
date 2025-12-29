// src/features/auth/components/LoginForm/LoginForm.tsx - ВИПРАВЛЕНО
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/auth';
import { showNotification } from '@/shared/utils/notifications';
import { TextInput, Checkbox, Group, Stack, Alert, Anchor, PasswordInput, ScrollArea } from '@mantine/core';
import { IconAlertCircle, IconLoader } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
const loginSchema = z.object({
  email: z.string().email('Неправильний формат email'),
  password: z.string().min(1, 'Пароль не може бути порожнім'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToForgotPassword }: LoginFormProps) => {
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const email = searchParams.get('email');
    const verified = searchParams.get('verified');

    if (email && verified === 'true') {
      setValue('email', decodeURIComponent(email));

      showNotification({
        title: '✅ Email підтверджено!',
        message: 'Тепер введіть ваш пароль для входу',
        color: 'green',
      });
    }
  }, [searchParams, setValue]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setError(null);

    try {
      await login(data.email, data.password);

      showNotification({
        title: 'Успішний вхід!',
        message: 'Вітаємо з поверненням!',
        color: 'green',
      });
      onSuccess?.();
      setTimeout(() => {
        router.push('/catalog');
      }, 300);
    } catch (error: any) {
      let errorMessage = error.message || 'Сталася помилка. Спробуйте ще раз.';

      const isEmailNotVerified =
        errorMessage.includes('Підтвердіть email') ||
        errorMessage.includes('Email not confirmed') ||
        errorMessage.includes('Підтвердіть email перед входом') ||
        errorMessage.includes('email перед входом');

      setError(errorMessage);

      showNotification({
        title: 'Помилка входу',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleForgotPassword = () => {
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    } else {
      router.push('/reset-password');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
      <ScrollArea flex={1} offsetScrollbars>
        <Stack gap="md">
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {error}
              {(error.includes('Підтвердіть email') ||
                error.includes('Email not confirmed') ||
                error.includes('Підтвердіть email перед входом') ||
                error.includes('email перед входом')) && (
                <div style={{ marginTop: '8px' }}>
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    onClick={() => router.push('/resend-verification')}
                    style={{ fontWeight: 600 }}>
                    → Якщо лист не прийшов
                  </Anchor>
                </div>
              )}
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

          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            required
            disabled={isLoading}
            {...register('password')}
            error={errors.password?.message}
          />

          <Group justify="space-between">
            <Checkbox label="Запам'ятати мене" disabled={isLoading} {...register('rememberMe')} />
            <Anchor
              component="button"
              type="button"
              size="sm"
              onClick={handleForgotPassword}
              style={{ opacity: isLoading ? 0.6 : 1,color:'#33603b' }}>
              Забули пароль?
            </Anchor>
          </Group>
        </Stack>
      </ScrollArea>

      <Button type="submit" fullWidth leftSection={isLoading ? <IconLoader size={16} /> : null} mt="md">
        Увійти
      </Button>
    </form>
  );
};

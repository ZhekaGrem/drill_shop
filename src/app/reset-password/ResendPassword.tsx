// src/app/reset-password/ResetPassword.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Paper,
  Title,
  Text,
  PasswordInput,
  Alert,
  Stack,
  Progress,
  List,
  ThemeIcon,
  Group,
  Loader,
  Center,
  ListItem,
} from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { IconAlertCircle, IconCheck, IconX, IconLock, IconCircleCheck } from '@tabler/icons-react';
import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import styles from './resendPassword.module.scss';

// Password validation schema
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Пароль повинен містити мінімум 8 символів')
      .regex(/(?=.*[a-z])/, 'Мінімум одна мала літера')
      .regex(/(?=.*[A-Z])/, 'Мінімум одна велика літера')
      .regex(/(?=.*\d)/, 'Мінімум одна цифра'),
    confirmPassword: z.string().min(1, "Підтвердження пароля обов'язкове"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Component content
const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchPassword = watch('newPassword');

  // Calculate password strength
  useEffect(() => {
    if (!watchPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (watchPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(watchPassword)) strength += 25;
    if (/[A-Z]/.test(watchPassword)) strength += 25;
    if (/\d/.test(watchPassword)) strength += 25;

    setPasswordStrength(strength);
  }, [watchPassword]);

  // Check token presence on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsTokenValid(false);
    } else {
      // Assume token is valid - backend will validate on submit
      setIsTokenValid(true);
      setIsValidating(false);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await apiClient.post(endpoints.auth.resetPassword, {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('❌ Password reset error:', error);

      // Handle specific error codes
      const errorCode = error.response?.data?.code;
      let errorMsg = 'Помилка зміни пароля';

      if (errorCode === 'TOKEN_EXPIRED' || error.response?.status === 401) {
        errorMsg = 'Посилання для відновлення пароля прострочене. Запросіть нове.';
        // Show token expired UI
        setIsTokenValid(false);
      } else if (errorCode === 'INVALID_TOKEN') {
        errorMsg = 'Невалідне посилання для відновлення пароля.';
        setIsTokenValid(false);
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state (no token provided or token was rejected)
  if (!token || (!isTokenValid && !isValidating)) {
    return (
      <Container size="xs" py="xl" className={styles.container}>
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="red">
              <IconX size={40} />
            </ThemeIcon>
            <Title order={3}>Невірне посилання</Title>
            <Text ta="center" c="dimmed">
              {errorMessage || 'Посилання для відновлення пароля недійсне або прострочене'}
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/catalog')} variant="outline" size="md">
              Запросити нове посилання
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={styles.container}>
        <Container size="xs" py="xl">
          <Paper radius="md" p="xl" withBorder className={styles.paper}>
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" color="green">
                <IconCircleCheck size={40} />
              </ThemeIcon>
              <Title order={3}>Пароль успішно змінено!</Title>
              <Text ta="center" c="dimmed">
                Тепер ви можете увійти з новим паролем
              </Text>
              <Button fullWidth mt="md" onClick={() => router.push('/catalog')} size="md">
                Перейти до входу
              </Button>
            </Stack>
          </Paper>
        </Container>
      </div>
    );
  }

  // Reset password form
  return (
    <div className={styles.container}>
      <Container size="xs" py="xl">
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack gap="lg">
            <div>
              <Group justify="center" mb="md">
                <ThemeIcon size={50} radius="xl" variant="light">
                  <IconLock size={30} />
                </ThemeIcon>
              </Group>
              <Title order={2} ta="center">
                Створення нового пароля
              </Title>
              <Text ta="center" c="dimmed" mt="sm">
                Введіть новий пароль для вашого акаунта
              </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack gap="md">
                {errorMessage && (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    {errorMessage}
                  </Alert>
                )}

                <div>
                  <PasswordInput
                    label="Новий пароль"
                    placeholder="Введіть новий пароль"
                    required
                    {...register('newPassword')}
                    error={errors.newPassword?.message}
                  />

                  {watchPassword && (
                    <>
                      <Progress
                        value={passwordStrength}
                        size="xs"
                        mt={5}
                        color={
                          passwordStrength <= 25
                            ? 'red'
                            : passwordStrength <= 50
                              ? 'orange'
                              : passwordStrength <= 75
                                ? 'yellow'
                                : 'green'
                        }
                      />
                      <Text size="xs" c="dimmed" mt={5}>
                        Сила пароля:{' '}
                        {passwordStrength <= 25
                          ? 'Слабкий'
                          : passwordStrength <= 50
                            ? 'Середній'
                            : passwordStrength <= 75
                              ? 'Хороший'
                              : 'Сильний'}
                      </Text>
                    </>
                  )}

                  <List
                    mt="xs"
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon color="gray" size={20} radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                    }>
                    <ListItem
                      icon={
                        watchPassword && watchPassword.length >= 8 ? (
                          <ThemeIcon color="green" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        ) : undefined
                      }>
                      Мінімум 8 символів
                    </ListItem>
                    <ListItem
                      icon={
                        watchPassword && /[a-z]/.test(watchPassword) ? (
                          <ThemeIcon color="green" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        ) : undefined
                      }>
                      Мінімум одна мала літера
                    </ListItem>
                    <ListItem
                      icon={
                        watchPassword && /[A-Z]/.test(watchPassword) ? (
                          <ThemeIcon color="green" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        ) : undefined
                      }>
                      Мінімум одна велика літера
                    </ListItem>
                    <ListItem
                      icon={
                        watchPassword && /\d/.test(watchPassword) ? (
                          <ThemeIcon color="green" size={20} radius="xl">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        ) : undefined
                      }>
                      Мінімум одна цифра
                    </ListItem>
                  </List>
                </div>

                <PasswordInput
                  label="Підтвердження пароля"
                  placeholder="Повторіть новий пароль"
                  required
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  size="md"
                  disabled={isLoading || passwordStrength < 100}>
                  Змінити пароль
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => router.push('/catalog')}
                  disabled={isLoading}>
                  Скасувати
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

// Main component with Suspense
const ResetPassword = () => {
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
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;

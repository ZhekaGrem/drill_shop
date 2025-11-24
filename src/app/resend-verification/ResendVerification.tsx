// src/app/resend-verification/ResendVerification.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Alert,
  Stack,
  ThemeIcon,
  Group,
  Anchor,
} from '@mantine/core';
import { IconAlertCircle, IconMail, IconSend } from '@tabler/icons-react';
import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import styles from './resendVerification.module.scss';
import { Button } from '@/shared/components/Button/Button';
const resendSchema = z.object({
  email: z.string().email('Невірний формат email'),
});

type ResendFormData = z.infer<typeof resendSchema>;

const ResendVerification = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await apiClient.post(endpoints.auth.resendVerification, {
        email: data.email,
      });

      if (response.data.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.data.message || 'Failed to resend verification');
      }
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);

      const errorMsg = error.response?.data?.message || error.message || 'Помилка надсилання email';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Container size="xs" py="xl" className={styles.container}>
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="green" variant="light">
              <IconMail size={40} />
            </ThemeIcon>
            <Title order={3}>Email надіслано!</Title>
            <Text ta="center" c="dimmed">
              Перевірте вашу пошту. Якщо email існує і не підтверджений, ви отримаєте нове посилання для
              підтвердження.
            </Text>
            <Text ta="center" c="dimmed" size="sm">
              Не забудьте перевірити папку "Спам"
            </Text>
            <Button fullWidth mt="md" onClick={() => router.push('/login')} size="md">
              Повернутись до входу
            </Button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text size="sm" c="dimmed">
                Забули пароль?{' '}
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  onClick={() => router.push('/login?action=forgot-password')}
                  disabled={isLoading}
                  style={{ fontWeight: 600, color: 'var(--accent-yellow)' }}>
                  Відновити пароль
                </Anchor>
              </Text>
            </div>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <div className={styles.container}>
      <Container size="xs" py="xl">
        <Paper radius="md" p="xl" withBorder className={styles.paper}>
          <Stack gap="lg">
            <div>
              <Group justify="center" mb="md">
                <ThemeIcon size={50} radius="xl" variant="light" color="blue">
                  <IconSend size={30} />
                </ThemeIcon>
              </Group>
              <Title order={2} ta="center">
                Підтвердження email
              </Title>
              <Text ta="center" c="dimmed" mt="sm">
                Введіть вашу електронну адресу, щоб отримати нове посилання для підтвердження
              </Text>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack gap="md">
                {errorMessage && (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    {errorMessage}
                  </Alert>
                )}

                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  type="email"
                  required
                  size="md"
                  leftSection={<IconMail size={18} />}
                  {...register('email')}
                  error={errors.email?.message}
                />

                <Stack gap="xs">
                  <Button type="submit" loading={isLoading} fullWidth disabled={isLoading}>
                    Надіслати підтвердження
                  </Button>

                  <Button fullWidth onClick={() => router.push('/login')} disabled={isLoading}>
                    Повернутись до входу
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default ResendVerification;

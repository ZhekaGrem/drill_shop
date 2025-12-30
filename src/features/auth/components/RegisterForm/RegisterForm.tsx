// src/features/auth/components/RegisterForm/RegisterForm.tsx - ВИПРАВЛЕНО
'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/auth';
import { showNotification } from '@/shared/utils/notifications';
import { TextInput, Group, Stack, Alert, PasswordInput, ScrollArea } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { useRouter } from 'next/navigation';
import { PhoneInput } from '@/shared/components/Input';
const registerSchema = z.object({
  firstName: z.string().min(1, "Ім'я є обов'язковим").max(50, "Ім'я занадто довге"),
  lastName: z.string().min(1, "Прізвище є обов'язковим").max(50, 'Прізвище занадто довге'),
  email: z.string().email('Неправильний формат email'),
  phone: z
    .string()
    .regex(/^\+380\d{9}$/, 'Введіть телефон у форматі +380XXXXXXXXX')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Пароль повинен містити мінімум 8 символів')
    .regex(/^(?=.*[a-z])/, 'Пароль повинен містити принаймні одну малу літеру')
    .regex(/^(?=.*[A-Z])/, 'Пароль повинен містити принаймні одну велику літеру')
    .regex(/^(?=.*\d)/, 'Пароль повинен містити принаймні одну цифру'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      const cleanData = {
        ...data,
        phone: data.phone?.trim() || undefined,
      };

      await registerUser(cleanData);

      // ✅ Успішна реєстрація та автологін
      showNotification({
        title: 'Вітаємо!',
        message: 'Ви успішно зареєструвались та увійшли в систему.',
      });

      // Закриваємо форму та перенаправляємо
      if (onSuccess) onSuccess();
      setTimeout(() => router.push('/catalog'), 1000);
    } catch (error: any) {
      console.error('❌ Registration form error:', error);

      setError('root', {
        type: 'manual',
        message: error.message || 'Сталася помилка. Спробуйте ще раз.',
      });

      showNotification({
        title: 'Помилка реєстрації',
        message: error.message || 'Спробуйте ще раз',
        color: 'red',
      });
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
          {errors.root && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {errors.root.message}
            </Alert>
          )}

          <Group grow>
            <TextInput
              label="Ім'я"
              placeholder="Іван"
              required
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <TextInput
              label="Прізвище"
              placeholder="Петренко"
              required
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </Group>

          <TextInput
            label="Email"
            placeholder="ivan@example.com"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                label="Телефон (необов'язково)"
                placeholder="+380 (XX) XXX XX XX"
                value={field.value}
                onChange={field.onChange}
                error={errors.phone?.message}
              />
            )}
          />

          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            required
            {...register('password')}
            error={errors.password?.message}
            description="Мінімум 8 символів, містити великі і малі літери, цифри"
          />
        </Stack>
      </ScrollArea>

      <Stack gap="sm" mt="md">
        <Button type="submit" fullWidth>
          Зареєструватися
        </Button>

        <Button fullWidth onClick={onSwitchToLogin}>
          Вже маєте акаунт? Увійти
        </Button>
      </Stack>
    </form>
  );
};

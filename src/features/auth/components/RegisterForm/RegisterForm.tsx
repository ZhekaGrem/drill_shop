// src/features/auth/components/RegisterForm/RegisterForm.tsx - ВИПРАВЛЕНО
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/auth';
import { notifications } from '@mantine/notifications';
import { TextInput, Group, Stack, Alert, PasswordInput } from '@mantine/core';
import { IconAlertCircle, IconMail } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { useRouter } from 'next/navigation';

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

      // ВАЖЛИВЕ ПОВІДОМЛЕННЯ про підтвердження email
      notifications.show({
        title: 'Підтвердіть email!',
        message: 'Перевірте пошту та натисніть на посилання для завершення реєстрації.',
        color: 'blue',
        icon: <IconMail size={20} />,
        autoClose: 6000,
      });
      setTimeout(() => router.push('/catalog'), 1500);
      // Перемикаємо на login tab
    } catch (error: any) {
      console.error('❌ Registration form error:', error);

      setError('root', {
        type: 'manual',
        message: error.message || 'Сталася помилка. Спробуйте ще раз.',
      });

      notifications.show({
        title: 'Помилка реєстрації',
        message: error.message || 'Спробуйте ще раз',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <TextInput
          label="Телефон (необов'язково)"
          placeholder="+380501234567"
          {...register('phone')}
          error={errors.phone?.message}
          description="Формат: +380XXXXXXXXX"
        />

        <PasswordInput
          label="Пароль"
          placeholder="Ваш пароль"
          required
          {...register('password')}
          error={errors.password?.message}
          description="Мінімум 8 символів, містити великі і малі літери, цифри"
        />

        <Button type="submit" fullWidth>
          Зареєструватися
        </Button>

        <Alert color="blue" variant="light">
          Після реєстрації ви отримаєте лист для підтвердження email
        </Alert>

        <Button variant="secondary" fullWidth onClick={onSwitchToLogin}>
          Вже маєте акаунт? Увійти
        </Button>
      </Stack>
    </form>
  );
};

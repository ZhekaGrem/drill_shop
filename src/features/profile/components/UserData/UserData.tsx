// src/pages/userProfile/UserProfile/UserData.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Stack, Title, PasswordInput, Group, Divider } from '@mantine/core';
import { useAuthStore } from '@/shared/stores/auth';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/shared/api';
import { Button } from '@/shared/components/Button/Button';

import styles from './UserData.module.scss';

// Схема для даних користувача
const userDataSchema = z.object({
  email: z.string().email('Невірний формат email'),
  firstName: z
    .string()
    .min(1, "Ім'я є обов'язковим")
    .regex(/^[A-Za-zА-Яа-яЇїІіЄєҐґ0-9]+$/, "Ім'я може містити лише букви та цифри"),
  lastName: z
    .string()
    .min(1, "Прізвище є обов'язковим")
    .regex(/^[A-Za-zА-Яа-яЇїІіЄєҐґ0-9]+$/, "Ім'я може містити лише букви та цифри"),
  phone: z
    .string()
    .regex(/^(\+380\d{9}|0\d{9})$/, "Телефон є обов'язковим у форматі +380XXXXXXXXX або 0XXXXXXXXX")
    .optional()
    .or(z.literal('')),
});

// Схема для зміни пароля
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Поточний пароль не може бути порожнім'),
    newPassword: z.string().min(8, 'Новий пароль повинен містити мінімум 8 символів'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

type UserDataForm = z.infer<typeof userDataSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const UserData = () => {
  const { userProfile, reloadProfile, isLoading } = useAuthStore();

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors },
    reset: resetUserForm,
  } = useForm<UserDataForm>({
    resolver: zodResolver(userDataSchema),
    defaultValues: {
      email: userProfile?.email || '',
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      phone: userProfile?.phone || '',
    },
  });

  // Оновлюємо форму коли змінюється userProfile
  useEffect(() => {
    if (userProfile) {
      resetUserForm({
        email: userProfile.email || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile, resetUserForm]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUserSubmit = async (data: UserDataForm) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      if (response.data.success && response.data.data) {
        await reloadProfile();
      }
      notifications.show({
        title: 'Успіх',
        message: 'Ваші дані було оновлено.',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Помилка',
        message: error.response?.data?.message || 'Не вдалося оновити дані.',
        color: 'red',
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      notifications.show({
        title: 'Успіх',
        message: 'Пароль було успішно змінено.',
        color: 'green',
      });
      resetPasswordForm();
    } catch (error: any) {
      notifications.show({
        title: 'Помилка',
        message: error.response?.data?.message || 'Не вдалося змінити пароль.',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="xl" className={styles.userDataForm}>
      {/* Редагування даних */}
      <form onSubmit={handleUserSubmit(onUserSubmit)} noValidate>
        <Stack>
          <Title order={4}>Змінити дані</Title>
          <Group grow>
            <TextInput label="Ім'я" {...registerUser('firstName')} error={userErrors.firstName?.message} />
            <TextInput label="Прізвище" {...registerUser('lastName')} error={userErrors.lastName?.message} />
          </Group>
          <TextInput label="Телефон" {...registerUser('phone')} error={userErrors.phone?.message} />
          <Group justify="flex-end">
            <Button type="submit" loading={isLoading}>
              Зберегти дані
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Зміна пароля */}
      {/* <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
        <Stack>
          <Title order={4}>Зміна пароля</Title>
          <PasswordInput
            label="Поточний пароль"
            {...registerPassword('currentPassword')}
            error={passwordErrors.currentPassword?.message}
          />
          <PasswordInput
            label="Новий пароль"
            {...registerPassword('newPassword')}
            error={passwordErrors.newPassword?.message}
          />
          <PasswordInput
            label="Підтвердіть новий пароль"
            {...registerPassword('confirmPassword')}
            error={passwordErrors.confirmPassword?.message}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isLoading}>
              Змінити пароль
            </Button>
          </Group>
        </Stack>
      </form> */}
    </Stack>
  );
};
export default UserData;

// src/app/(routes)/(auth)/register/page.tsx
'use client';
import { RegisterForm } from '@/features/auth/components/RegisterForm/RegisterForm';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title } from '@mantine/core';

const Register = () => {
  const router = useRouter();

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="xl">
          Реєстрація
        </Title>
        <RegisterForm
          onSuccess={() => router.push('/verify-email')}
          onSwitchToLogin={() => router.push('/login')}
        />
      </Paper>
    </Container>
  );
};

export default Register;

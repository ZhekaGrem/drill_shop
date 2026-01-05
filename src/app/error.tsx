'use client';

import { useEffect } from 'react';
import { Container, Title, Text, Group, MantineProvider } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';

const Error = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MantineProvider>
      <Container className="py-20">
        <div className="text-center">
          <Title order={1} className=" mb-4">
            Помилка
          </Title>
          <Title order={2} className="mb-4">
            Ой, щось пішло не так...
          </Title>
          <Text size="lg" className="mb-8 text-gray-600">
            На жаль, сталася непередбачена помилка. Наша команда вже отримала сповіщення.
          </Text>
          <Group justify="center">
            <Button variant="ghost" size="md" onClick={reset}>
              Спробувати знову
            </Button>
          </Group>
        </div>
      </Container>
    </MantineProvider>
  );
};

export default Error;

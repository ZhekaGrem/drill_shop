// src/shared/lib/providers/ErrorBoundary.tsx
'use client';

import React from 'react';
import { Container, Title, Text, Button } from '@mantine/core';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-20 text-center">
          <Title order={2}>Щось пішло не так</Title>
          <Text className="my-4">Спробуйте перезавантажити сторінку</Text>
          <Button onClick={() => window.location.reload()}>Перезавантажити</Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

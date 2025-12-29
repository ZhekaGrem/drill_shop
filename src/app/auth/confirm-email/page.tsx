// src/app/auth/confirm-email/page.tsx - З ДЕТАЛЬНИМИ ЛОГАМИ
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Text, Loader, Alert } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { Button } from '@/shared/components/Button/Button';
export default function ConfirmEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Підтверджуємо ваш email...');
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  const addDebug = (msg: string, data?: any) => {
    const timestamp = new Date().toISOString();
    setDebugInfo((prev) => [...prev, { timestamp, msg, data }]);
  };

  useEffect(() => {
    const verifyEmail = async () => {
      addDebug('🚀 useEffect triggered');

      try {
        const token = searchParams.get('token');
        addDebug('🔑 Token from URL:', token);

        if (!token) {
          addDebug('❌ No token found');
          throw new Error('Відсутній токен підтвердження');
        }

        addDebug('📤 Sending verification request to backend...');
        setMessage('Відправляємо запит на сервер...');

        // 1. Верифікуємо email на бекенді
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // ❌ БЕЗ Authorization header!
          },
          body: JSON.stringify({ token }),
        });

        addDebug('📥 Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          addDebug('❌ Response not OK:', errorData);
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        addDebug('📥 Backend response received:', data);

        if (!data.success) {
          addDebug('❌ Backend returned success=false');
          throw new Error(data.message || 'Помилка верифікації');
        }

        addDebug('✅ Backend returned success=true');

        const email = data.data?.email || data.email;

        addDebug('📧 Email from response:', email);

        // 2. Встановлюємо success status
        addDebug('🎯 Setting status to SUCCESS');
        setStatus('success');

        addDebug('💬 Setting success message');
        setMessage('Email успішно підтверджено!');

        // 3. Редірект на головну
        addDebug('⏰ Starting redirect timer (2000ms)');
        setTimeout(() => {
          addDebug('🔄 Redirecting to home...');
          router.push('/');
        }, 2000);
      } catch (error: any) {
        addDebug('❌ ERROR caught:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack,
        });

        console.error('❌ Email verification error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            error.message ||
            'Помилка підтвердження email. Можливо, посилання застаріло.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        
      }}>
      <Container size="sm">
        <Paper p="xl" shadow="md" radius="md">
          <div style={{ textAlign: 'center' }}>
            {/* Debug Panel - показується тільки в development */}
            {/* {process.env.NODE_ENV === 'development' && (
              <Alert color="gray" mb="md" title="Debug Info">
                <div style={{ textAlign: 'left', maxHeight: '200px', overflow: 'auto' }}>
                  <Text size="xs" component="pre" style={{ fontSize: '10px' }}>
                    Current Status: {status}
                    {'\n'}
                    {debugInfo.map((info, i) => (
                      `\n[${i}] ${info.msg} ${info.data ? JSON.stringify(info.data, null, 2) : ''}`
                    )).join('')}
                  </Text>
                </div>
              </Alert>
            )} */}

            {status === 'loading' && (
              <>
                <Loader size="lg" mb="md" color="yellow" />
                <Text size="lg" fw={500}>
                  {message}
                </Text>
                <Text size="sm" c="dimmed" mt="sm">
                  Це може зайняти кілька секунд...
                </Text>
              </>
            )}

            {status === 'success' && (
              <>
                <IconCheck size={64} color="green" style={{ margin: '0 auto 1rem' }} />
                <Text size="lg" mb="md" c="green" fw={600}>
                  {message}
                </Text>
                <Text size="sm" c="dimmed">
                  Перенаправляємо на сторінку входу...
                </Text>
              </>
            )}

            {status === 'error' && (
              <>
                <IconX size={64} color="red" style={{ margin: '0 auto 1rem' }} />
                <Alert color="red" mb="md">
                  {message}
                </Alert>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Button onClick={() => router.push('/')} color="yellow">
                    На головну
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline" color="gray">
                    Спробувати ще раз
                  </Button>
                </div>
              </>
            )}
          </div>
        </Paper>
      </Container>
    </div>
  );
}

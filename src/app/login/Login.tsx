'use client';

import { useState, useEffect, useRef } from 'react';
import { Paper, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthModal } from '@/features/auth/components/AuthModal/AuthModal';
import { Page } from '@/shared/components/Page/Page';
import { useAuthStore } from '@/shared/stores/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuthStore();

  const isInitialMount = useRef(true);

  const [authOpened, setAuthOpened] = useState(true);
  const [defaultTab, setDefaultTab] = useState<'login' | 'register' | 'forgot-password'>('login');

  const from = searchParams.get('from') || '/';
  const message = searchParams.get('message');
  const action = searchParams.get('action');

  // Set default tab based on action
  useEffect(() => {
    if (action === 'register') {
      setDefaultTab('register');
    } else if (action === 'forgot-password') {
      setDefaultTab('forgot-password');
    }
  }, [action]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isInitialized && isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, isInitialized, router, from]);

  const handleAuthClose = () => {
    router.push('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
      <Page width="narrow">
        <Paper>
          {message && (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" mb="lg">
              {message}
            </Alert>
          )}

          <AuthModal
            opened={authOpened}
            onClose={handleAuthClose}
            defaultTab={defaultTab}
            onSuccess={() => {}}
          />
        </Paper>
      </Page>
    </div>
  );
}

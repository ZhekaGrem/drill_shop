// src/features/auth/components/AuthModal/AuthModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal, Tabs, Text } from '@mantine/core';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { PasswordResetForm } from '../PasswordResetForm/PasswordResetForm';
import styles from './authModal.module.scss';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: 'login' | 'register' | 'forgot-password';
}

export const AuthModal = ({ opened, onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text className={styles.title}>Автентифікація</Text>}
      size="md"
      centered
      classNames={{ content: styles.modalContent, body: styles.modalBody }}>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List grow>
          <Tabs.Tab value="login">Вхід</Tabs.Tab>
          <Tabs.Tab value="register">Реєстрація</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="lg">
          <LoginForm
            onSuccess={onSuccess}
            onSwitchToForgotPassword={() => handleTabChange('forgot-password')}
          />
        </Tabs.Panel>

        <Tabs.Panel value="register" pt="lg">
          <RegisterForm onSuccess={onSuccess} onSwitchToLogin={() => handleTabChange('login')} />
        </Tabs.Panel>

        <Tabs.Panel value="forgot-password" pt="lg">
          <PasswordResetForm
            onSuccess={() => handleTabChange('login')}
            onBackToLogin={() => handleTabChange('login')}
          />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

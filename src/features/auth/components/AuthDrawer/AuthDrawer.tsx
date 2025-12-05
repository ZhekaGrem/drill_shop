// src/features/auth/components/AuthDrawer/AuthDrawer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Drawer, Tabs, Text } from '@mantine/core';
import { IconUser, IconX } from '@tabler/icons-react';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { PasswordResetForm } from '../PasswordResetForm/PasswordResetForm';
import styles from './AuthDrawer.module.scss';

interface AuthDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: 'login' | 'register' | 'forgot-password';
}

export const AuthDrawer = ({ opened, onClose, onSuccess, defaultTab = 'login' }: AuthDrawerProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="600px"
      className={styles.drawer}
      title={
        <div className={styles.header}>
          <IconUser size={24} />
          <span>Автентифікація</span>
        </div>
      }
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        className={styles.tabs}
        style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Tabs.List grow className={styles.tabsList}>
          <Tabs.Tab value="login" className={styles.tab}>
            Вхід
          </Tabs.Tab>
          <Tabs.Tab value="register" className={styles.tab}>
            Реєстрація
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          value="login"
          pt="lg"
          className={styles.tabs}
          style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToForgotPassword={() => handleTabChange('forgot-password')}
          />
        </Tabs.Panel>

        <Tabs.Panel
          value="register"
          pt="lg"
          className={styles.tabs}
          style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => handleTabChange('login')} />
        </Tabs.Panel>

        <Tabs.Panel
          value="forgot-password"
          pt="lg"
          className={styles.tabs}
          style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <PasswordResetForm
            onSuccess={() => handleTabChange('login')}
            onBackToLogin={() => handleTabChange('login')}
          />
        </Tabs.Panel>
      </Tabs>
    </Drawer>
  );
};

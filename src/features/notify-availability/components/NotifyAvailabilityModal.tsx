// src/features/notify-availability/components/NotifyAvailabilityModal.tsx
'use client';

import { useState } from 'react';
import { Modal, SegmentedControl, TextInput, Stack, Text } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { notifyAvailabilityApi } from '../api/notify-api';
import { notifications } from '@mantine/notifications';

interface NotifyAvailabilityModalProps {
  opened: boolean;
  onClose: () => void;
  productName: string;
  productSlug: string;
  variantName?: string;
}

type ContactMethod = 'telegram' | 'email' | 'instagram';

export function NotifyAvailabilityModal({
  opened,
  onClose,
  productName,
  productSlug,
  variantName,
}: NotifyAvailabilityModalProps) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [contactValue, setContactValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPlaceholder = () => {
    switch (contactMethod) {
      case 'telegram':
        return '@username або номер телефону';
      case 'email':
        return 'example@email.com';
      case 'instagram':
        return '@username';
    }
  };

  const getLabel = () => {
    switch (contactMethod) {
      case 'telegram':
        return 'Telegram';
      case 'email':
        return 'Email';
      case 'instagram':
        return 'Instagram';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactValue.trim()) {
      notifications.show({
        title: 'Помилка',
        message: 'Заповніть поле контакту',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await notifyAvailabilityApi.sendNotification({
        productName,
        productSlug,
        contactMethod,
        contactValue: contactValue.trim(),
        variantName,
      });

      notifications.show({
        title: 'Успішно!',
        message: response.message,
        color: 'green',
      });

      setContactValue('');
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Помилка',
        message: error instanceof Error ? error.message : 'Щось пішло не так',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContactValue('');
    setContactMethod('telegram');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Сповістити про появу товару" size="md" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Оберіть зручний спосіб зв'язку, і ми повідомимо вас, коли товар з'явиться в наявності.
          </Text>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Спосіб зв'язку:
            </Text>
            <SegmentedControl
              fullWidth
              value={contactMethod}
              onChange={(value) => setContactMethod(value as ContactMethod)}
              data={[
                { label: 'Telegram', value: 'telegram' },
                { label: 'Email', value: 'email' },
                { label: 'Instagram', value: 'instagram' },
              ]}
            />
          </div>

          <TextInput
            label={getLabel()}
            placeholder={getPlaceholder()}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" fullWidth loading={isLoading} disabled={isLoading}>
            Відправити запит
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

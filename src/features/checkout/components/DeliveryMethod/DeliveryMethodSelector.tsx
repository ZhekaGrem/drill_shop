// src/features/checkout/components/DeliveryMethodSelector.tsx
'use client';

import { useState } from 'react';
import { Textarea, Button, Group, Checkbox, Stack } from '@mantine/core';
import styles from './DeliveryMethodSelector.module.scss';

interface DeliveryMethodSelectorProps {
  deliveryMethod: 'nova_poshta' | 'other';
  onDeliveryMethodChange: (method: 'nova_poshta' | 'other') => void;
  customDeliveryText: string;
  onCustomDeliveryChange: (text: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  doNotCall: boolean;
  onDoNotCallChange: (value: boolean) => void;
}

export function DeliveryMethodSelector({
  deliveryMethod,
  onDeliveryMethodChange,
  customDeliveryText,
  onCustomDeliveryChange,
  notes,
  onNotesChange,
  doNotCall,
  onDoNotCallChange,
}: DeliveryMethodSelectorProps) {
  const quickButtons = [
    { label: 'Укрпошта', text: 'Укрпошта' },
    { label: 'Містекспрес', text: 'Містекспрес' },
  ];

  const insertQuickText = (text: string) => {
    // 🔒 FIXED: Використовуємо кому замість переносу рядка
    onCustomDeliveryChange(customDeliveryText ? `${customDeliveryText}, ${text}` : text);
  };

  return (
    <Stack gap="md">
      {/* Метод доставки */}
      <div>
        <label className={styles.label}>Метод доставки</label>
        <Group gap="sm">
          <Button
            variant={deliveryMethod === 'nova_poshta' ? 'filled' : 'outline'}
            onClick={() => onDeliveryMethodChange('nova_poshta')}
            fullWidth>
            Нова Пошта
          </Button>
          <Button
            variant={deliveryMethod === 'other' ? 'filled' : 'outline'}
            onClick={() => onDeliveryMethodChange('other')}
            fullWidth>
            Інше
          </Button>
        </Group>
      </div>

      {/* Якщо вибрано "Інше" - показуємо textarea з кнопками */}
      {deliveryMethod === 'other' && (
        <div>
          <label className={styles.label}>Адреса доставки</label>
          <Group gap="xs" mb="xs">
            {quickButtons.map((btn) => (
              <Button key={btn.text} size="xs" variant="light" onClick={() => insertQuickText(btn.text)}>
                {btn.label}
              </Button>
            ))}
          </Group>

          <Textarea
            placeholder="Вкажіть спосіб доставки та адресу"
            value={customDeliveryText}
            onChange={(e) => onCustomDeliveryChange(e.target.value)}
            minRows={3}
            required
          />
        </div>
      )}

      {/* Побажання до замовлення */}
      <Textarea
        label="Побажання до замовлення"
        placeholder="Напр: пиріг зробіть більш прожареним"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        minRows={2}
      />

      {/* Чекбокс "Не дзвонити" */}
      <Checkbox
        label="Не дзвонити для уточнення"
        checked={doNotCall}
        onChange={(e) => onDoNotCallChange(e.currentTarget.checked)}
      />
    </Stack>
  );
}

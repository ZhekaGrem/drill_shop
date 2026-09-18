// src/features/wishes/components/WishMessageField.tsx
// Поле побажання з демо-набором: поки людина нічого не ввела, у полі «хтось
// друкує» репліки-підказки (useTypingDemo). Демо — не значення поля: submit
// бачить лише `value`. Перший тап, фокус чи клавіша глушать демо, і поле
// стає порожнім зі звичайним плейсхолдером. Демо приглушене через
// [data-demo] у WishSheet.module.scss.
'use client';

import { TextareaField } from '@/shared/components/Input';
import { content } from '@/shared/config/content';
import { useTypingDemo } from '../hooks/useTypingDemo';
import { WISH_MESSAGE_MAX } from '../lib/wish-message';

interface WishMessageFieldProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  disabled: boolean;
  /** Шторка відкрита і форма в стані idle */
  demoEnabled: boolean;
}

export const WishMessageField = ({
  value,
  onChange,
  error,
  disabled,
  demoEnabled,
}: WishMessageFieldProps) => {
  const demo = useTypingDemo(demoEnabled, value !== '');
  const showingDemo = demo.text !== null;

  return (
    <TextareaField
      label={content.wishes.messageLabel}
      placeholder={content.wishes.messagePlaceholder}
      value={demo.text ?? value}
      onChange={(e) => onChange(e.currentTarget.value)}
      onPointerDown={demo.stop}
      onFocus={demo.stop}
      onKeyDown={demo.stop}
      data-demo={showingDemo || undefined}
      error={error}
      autosize
      minRows={1}
      maxRows={6}
      maxLength={WISH_MESSAGE_MAX}
      disabled={disabled}
    />
  );
};

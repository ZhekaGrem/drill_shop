import { forwardRef } from 'react';
import { normalizeTelegramHandle } from '@/shared/utils/telegram-handle';
import { Input } from './Input';

interface TelegramInputProps {
  onChange?: (value: string) => void;
  onBlur?: () => void;
  value?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
}

// «@» завжди першим символом значення: у фокусі порожнє поле одразу отримує
// «@», ввід без нього — «@» спереду, ввід з ним — без другого (зайві «@»
// прибирає normalizeTelegramHandle). Самотній «@» при виході з поля
// стирається, щоб показався плейсхолдер і спрацювала помилка «обовʼязкове».
export const TelegramInput = forwardRef<HTMLInputElement, TelegramInputProps>(
  ({ onChange, onBlur, value = '', placeholder = '@username', ...props }, ref) => (
    <Input
      ref={ref}
      type="text"
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      onFocus={() => {
        if (!value) onChange?.('@');
      }}
      onChange={(e) => onChange?.(normalizeTelegramHandle(e.target.value))}
      onBlur={() => {
        if (value === '@') onChange?.('');
        onBlur?.();
      }}
      {...props}
    />
  )
);

TelegramInput.displayName = 'TelegramInput';

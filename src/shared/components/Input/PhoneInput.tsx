import { forwardRef, useCallback } from 'react';
import { Input } from './Input';

interface PhoneInputProps {
  onChange?: (value: string) => void;
  onBlur?: () => void;
  value?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Приймаємо номер у будь-якому вигляді, який показує плейсхолдер
// (+380 (XX) XXX XX XX, з пробілами й дужками), або в короткій формі
// 0XXXXXXXXX, і зводимо його до канонічного вигляду, який очікує валідатор
// (checkoutSchema.shippingAddress.phone): +380XXXXXXXXX або 0XXXXXXXXX.
// Postel's Law: чистимо ввід, а не відхиляємо номер лише через пробіли й
// дужки, які людина набрала так само, як підказує сам плейсхолдер поля.
const normalizePhone = (raw: string): string => {
  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.startsWith('380')) {
    return `+${digitsOnly.slice(0, 12)}`; // +380 + 9 цифр номера
  }

  if (digitsOnly.startsWith('0')) {
    return digitsOnly.slice(0, 10); // 0 + 9 цифр номера
  }

  // Проміжний стан під час набору коду країни (наприклад, «3», «38») —
  // повертаємо цифри як є, без вгадування форми.
  return digitsOnly;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value = '', placeholder = '+380 (XX) XXX XX XX', ...props }, ref) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(normalizePhone(e.target.value));
      },
      [onChange]
    );

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

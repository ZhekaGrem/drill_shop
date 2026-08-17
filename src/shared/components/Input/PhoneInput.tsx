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
//
// Нормалізація прибирає лише ФОРМАТУВАННЯ (пробіли, дужки, тире, провідний
// «+») — і ніколи не ріже цифри. Раніше зайва цифра (описка, здвоєний код
// країни, зайвий символ після вставки з контактів) мовчки відрізалась
// slice()-ом до якогось іншого, коротшого і при цьому валідного номера — і
// саме такий, вже чужий, номер летів кур'єру без жодного попередження. Тепер
// задовгий ввід повертається як є (без обрізання) і провалює регулярку
// валідатора — про помилку каже наявне інлайн-повідомлення, а не тихе
// перезаписування чужого номера.
const normalizePhone = (raw: string): string => {
  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.startsWith('380')) {
    return `+${digitsOnly}`; // +380 + 9 цифр номера — довший ввід валідатор відхилить сам
  }

  if (digitsOnly.startsWith('0')) {
    return digitsOnly; // 0 + 9 цифр номера — довший ввід валідатор відхилить сам
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

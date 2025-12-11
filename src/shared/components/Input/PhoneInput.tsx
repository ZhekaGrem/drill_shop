import { forwardRef, useState, useCallback } from 'react';
import { Input } from './Input';

interface PhoneInputProps {
  onChange?: (value: string) => void;
  value?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value = '', placeholder = '+380 (XX) XXX XX XX', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const phonePrefix = '+380';

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);

        // Якщо поле порожнє - додаємо +380
        if (!value || value.trim() === '') {
          onChange?.(phonePrefix);
          // Встановлюємо курсор після +380
          setTimeout(() => {
            if (e.target) {
              e.target.setSelectionRange(phonePrefix.length, phonePrefix.length);
            }
          }, 0);
        }
      },
      [value, onChange, phonePrefix]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Не дозволяємо видаляти +380
        if (!newValue.startsWith(phonePrefix)) {
          newValue = phonePrefix;
        }

        onChange?.(newValue);
      },
      [onChange, phonePrefix]
    );

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      // Якщо залишилось тільки +380 - очищаємо
      if (value === phonePrefix) {
        onChange?.('');
      }
    }, [value, onChange, phonePrefix]);

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

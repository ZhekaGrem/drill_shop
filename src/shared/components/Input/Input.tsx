import {
  TextInput,
  TextInputProps,
  PasswordInput,
  PasswordInputProps,
  Textarea,
  TextareaProps,
} from '@mantine/core';
import styles from './Input.module.scss';
import { forwardRef } from 'react';
import clsx from 'clsx';
export type InputVariant = 'default' | 'underline' | 'minimal' |'textarea';

// Пропси для звичайного інпута
interface CustomInputProps extends Omit<TextInputProps, 'variant'> {
  variant?: InputVariant;
}

export const Input = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ variant = 'underline', className, classNames, leftSection, rightSection, ...props }, ref) => {
    const variantClass = styles[variant] || styles.underline;

    // Додаємо padding для input якщо є leftSection або rightSection
    const inputStyles: React.CSSProperties = {};
    if (leftSection) inputStyles.paddingLeft = '40px';
    if (rightSection) inputStyles.paddingRight = '40px';

    return (
      <TextInput
        ref={ref}
        leftSection={leftSection}
        rightSection={rightSection}
        classNames={{
          input: variantClass,
          label: styles.label,
          error: styles.error,
          ...classNames,
        }}
        styles={{
          input: inputStyles,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// Пропси для інпута пароля
interface CustomPasswordInputProps extends Omit<PasswordInputProps, 'variant'> {
  variant?: InputVariant;
}

export const PasswordField = forwardRef<HTMLInputElement, CustomPasswordInputProps>(
  ({ variant = 'underline', className, classNames, leftSection, rightSection, ...props }, ref) => {
    const variantClass = styles[variant] || styles.underline;

    // Додаємо padding для input якщо є leftSection
    const inputStyles: React.CSSProperties = {};
    if (leftSection) inputStyles.paddingLeft = '40px';
    // rightSection для PasswordInput зарезервовано для кнопки показу/приховування
    if (rightSection) inputStyles.paddingRight = '40px';

    return (
      <PasswordInput
        ref={ref}
        leftSection={leftSection}
        rightSection={rightSection}
        classNames={{
          input: variantClass,
          label: styles.label,
          error: styles.error,
          ...classNames,
        }}
        styles={{
          input: inputStyles,
        }}
        {...props}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';

// Пропси для textarea
interface CustomTextareaProps extends Omit<TextareaProps, 'variant'> {
  variant?: InputVariant;

}

export const TextareaField = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ variant = 'textarea', className, classNames, ...props }, ref) => {
    const variantClass = styles[variant] || styles.textarea;

    return (
      <Textarea
        ref={ref}
        classNames={{
          input: clsx(variantClass),
          label: styles.label,
          error: styles.error,
          ...classNames,
        }}
        styles={{
          input: {
            border: 'var(--border-width) solid var(--border-color)',
            borderRadius: 0,
          },
        }}
        {...props}
      />
    );
  }
);

TextareaField.displayName = 'TextareaField';

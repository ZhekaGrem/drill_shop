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

export type InputVariant = 'default' | 'underline' | 'minimal';

// Пропси для звичайного інпута
interface CustomInputProps extends Omit<TextInputProps, 'variant'> {
  variant?: InputVariant;
}

export const Input = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ variant = 'underline', className, classNames, ...props }, ref) => {
    const variantClass = styles[variant] || styles.underline;

    return (
      <TextInput
        ref={ref}
        classNames={{
          input: variantClass,
          label: styles.label,
          error: styles.error,
          ...classNames,
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
  ({ variant = 'underline', className, classNames, ...props }, ref) => {
    const variantClass = styles[variant] || styles.underline;

    return (
      <PasswordInput
        ref={ref}
        classNames={{
          input: variantClass,
          label: styles.label,
          error: styles.error,
          ...classNames,
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
  ({ variant = 'underline', className, classNames, ...props }, ref) => {
    const variantClass = styles[variant] || styles.underline;

    return (
      <Textarea
        ref={ref}
        classNames={{
          input: variantClass,
          label: styles.label,
          error: styles.error,
          ...classNames,
        }}
        {...props}
      />
    );
  }
);

TextareaField.displayName = 'TextareaField';

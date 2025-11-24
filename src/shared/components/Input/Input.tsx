import { TextInput, TextInputProps, PasswordInput, PasswordInputProps } from '@mantine/core';
import styles from './Input.module.scss';
import clsx from 'clsx';

// Пропси для звичайного інпута
type CustomInputProps = TextInputProps;

export const Input = ({ className, ...props }: CustomInputProps) => {
  return <TextInput classNames={{ input: clsx(styles.customInput, className) }} {...props} />;
};

// Пропси для інпута пароля
type CustomPasswordInputProps = PasswordInputProps;

export const PasswordField = ({ className, ...props }: CustomPasswordInputProps) => {
  return <PasswordInput classNames={{ input: clsx(styles.customInput, className) }} {...props} />;
};

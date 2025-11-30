// src/shared/components/Select/Select.tsx
import { Select as MantineSelect, SelectProps as MantineSelectProps } from '@mantine/core';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './select.module.scss';

interface SelectProps extends Omit<MantineSelectProps, 'variant' | 'size'> {
  variant?: 'default' | 'filled' | 'bordered';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLInputElement, SelectProps>(
  ({ variant = 'default', size = 'md', fullWidth = false, className, ...props }, ref) => {
    return (
      <MantineSelect
        ref={ref}
        className={clsx(
          styles.select,
          styles[`select--${variant}`],
          styles[`select--${size}`],
          fullWidth && styles['select--fullWidth'],
          className
        )}
        classNames={{
          input: clsx(
            styles.select__input,
            styles[`select__input--${variant}`],
            styles[`select__input--${size}`]
          ),
          dropdown: styles.select__dropdown,
          option: styles.select__option,
        }}
        unstyled
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';

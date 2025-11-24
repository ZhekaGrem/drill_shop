// src/shared/components/ui/Button/Button.tsx
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './button.module.scss';

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fl' | 'promo';
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'xl', fullWidth = false, className, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        className={clsx(
          styles.button,
          styles[`button--${variant}`],
          styles[`button--${size}`],
          fullWidth && styles['button--fullWidth'],
          className
        )}
        unstyled
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

// src/shared/components/ui/Button/Button.tsx
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './button.module.scss';

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'menu' | 'fl' | 'promo';
  fullWidth?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth = false, className, leftIcon, rightIcon, ...props },
    ref
  ) => {
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
        leftSection={leftIcon}
        rightSection={rightIcon}
        // mod → data-атрибути на DOM-вузлі (false просто не рендериться).
        //
        // data-ds-button: `unstyled` НЕ прибирає статичний клас
        // .mantine-Button-root (він гейтиться withStaticClasses, не unstyled),
        // тому без цього маркера наша кнопка ловила б ще й глобальне
        // Mantine-правило з globals.css — і градієнт поїхав би на secondary,
        // outline та ghost. Селектор там виключає [data-ds-button].
        //
        // data-gradient-btn: за нього чіпляється useRandomGradientPhase, який
        // на кожне наведення перекидає градієнт у випадкову точку циклу.
        mod={{ 'ds-button': true, 'gradient-btn': variant === 'primary' }}
        unstyled
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

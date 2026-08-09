// src/shared/components/ArrowCircle/ArrowCircle.tsx
// Чорне коло зі стрілкою — наскрізний афорданс «тут можна перейти» з Дії.
// У Дії це один і той самий елемент у кожному рядку списку й у куті кожної картки;
// у нас він раніше існував трьома різними способами (гола іконка 24px, коло в
// слайдері, стрілка всередині кнопки) — тому й не читався як одна мова.
import clsx from 'clsx';
import { ArrowRight } from '@/shared/components/Svg';
import styles from './ArrowCircle.module.scss';

interface ArrowCircleProps {
  /** md — 44px (висота контролу за дизайн-системою), sm — 32px для щільних рядків */
  size?: 'sm' | 'md';
  className?: string;
}

export const ArrowCircle = ({ size = 'md', className }: ArrowCircleProps) => (
  <span aria-hidden="true" className={clsx(styles.circle, styles[`circle--${size}`], className)}>
    <ArrowRight size={size === 'sm' ? 16 : 20} />
  </span>
);

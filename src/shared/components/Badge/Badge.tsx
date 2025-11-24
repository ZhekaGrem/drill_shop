// src/shared/components/Badge/Badge.tsx
import React from 'react';
import styles from './Badge.module.scss';

export type BadgeType = 'promo' | 'featured' | 'discount' | 'new' | 'outOfStock';

export interface BadgeProps {
  type: BadgeType;
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, text, className = '' }) => {
  const badgeClass = `badge${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return <div className={`${styles.badge} ${styles[badgeClass]} ${className}`}>{text}</div>;
};

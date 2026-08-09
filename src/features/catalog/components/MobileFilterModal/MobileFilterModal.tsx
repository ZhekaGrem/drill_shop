// src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx
import React from 'react';
import { Drawer } from '@mantine/core';
import { Category } from '@/shared/types';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import styles from './MobileFilterModal.module.scss';

interface MobileFilterModalProps {
  opened: boolean;
  onClose: () => void;
  onFiltersChange: () => void;
  initialCategories?: Category[];
  /** Скільки товарів дає поточна вибірка — йде в підпис кнопки */
  resultsCount?: number;
}

/** «Показати 24 товари» / «Показати 1 товар» */
function formatApplyLabel(count?: number): string {
  if (count === undefined) return 'Показати результати';

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `Показати ${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `Показати ${count} товари`;
  return `Показати ${count} товарів`;
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  opened,
  onClose,
  onFiltersChange,
  initialCategories,
  resultsCount,
}) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      title="Фільтри"
      className={styles.drawer}>
      <CatalogFilters
        onFiltersChange={onFiltersChange}
        initialCategories={initialCategories}
        resultsCount={resultsCount}
      />

      {/* Головна дія sheet — закріплена, не тікає при скролі списку фільтрів */}
      <div className={styles.footer}>
        <button type="button" className={styles.applyButton} onClick={onClose}>
          {formatApplyLabel(resultsCount)}
        </button>
      </div>
    </Drawer>
  );
};

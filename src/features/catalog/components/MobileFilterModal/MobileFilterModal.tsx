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

/** «24 товари» / «1 товар» */
function formatProducts(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} товари`;
  return `${count} товарів`;
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

      {/* Кнопка звалась «Показати 24 товари», а її обробник — onClose.
          Фільтри застосовуються миттєво, тобто показувати вже нічого не треба:
          напис обіцяв дію, якої не було (Nielsen #2 — мова системи ≠ реальність).
          Тепер це чесне «Готово», а число живе поруч як тихий підпис —
          саме воно і є зворотним звʼязком про результат фільтрації. */}
      <div className={styles.footer}>
        {resultsCount !== undefined && (
          <span className={styles.footerCount} aria-live="polite">
            Знайдено {formatProducts(resultsCount)}
          </span>
        )}
        <button type="button" className={styles.applyButton} onClick={onClose}>
          Готово
        </button>
      </div>
    </Drawer>
  );
};

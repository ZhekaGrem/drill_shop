// src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx
import React from 'react';
import { Sheet } from '@/shared/components/Sheet';
import { Category } from '@/shared/types';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { formatProducts } from '@/shared/utils/format';
import styles from './MobileFilterModal.module.scss';

interface MobileFilterModalProps {
  opened: boolean;
  onClose: () => void;
  onFiltersChange: () => void;
  initialCategories?: Category[];
  /** Скільки товарів дає поточна вибірка — йде в підпис кнопки */
  resultsCount?: number;
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  opened,
  onClose,
  onFiltersChange,
  initialCategories,
  resultsCount,
}) => {
  return (
    <Sheet opened={opened} onClose={onClose} title="Фільтри">
      <CatalogFilters onFiltersChange={onFiltersChange} initialCategories={initialCategories} />

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
    </Sheet>
  );
};

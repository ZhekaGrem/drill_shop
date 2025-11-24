// src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx
import React from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import styles from './MobileFilterModal.module.scss';
import { Button } from '@/shared/components/Button/Button';

interface MobileFilterModalProps {
  opened: boolean;
  onClose: () => void;
  onFiltersChange: () => void;
  initialCategories?: any[]; // ✅ ДОДАНО
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  opened,
  onClose,
  onFiltersChange,
  initialCategories,
}) => {
  const handleApply = () => {
    onFiltersChange();
    onClose();
  };

  const handleFilterUpdate = () => {
    // Нічого не робимо - просто оновлюються фільтри
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="400px"
      className={styles.modal}
      scrollAreaComponent={ScrollArea.Autosize}
      closeButtonProps={{ size: 'md' }}>
      <div className={styles.content}>
        <CatalogFilters onFiltersChange={handleFilterUpdate} initialCategories={initialCategories} />
        <div className={styles.actions}>
          <Button fullWidth size="md" onClick={onClose} className={styles.applyButton}>
            Закрити
          </Button>
        </div>
      </div>
    </Modal>
  );
};

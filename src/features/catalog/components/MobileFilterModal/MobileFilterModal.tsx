// src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx
import React from 'react';
import { Drawer } from '@mantine/core';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import styles from './MobileFilterModal.module.scss';

interface MobileFilterModalProps {
  opened: boolean;
  onClose: () => void;
  onFiltersChange: () => void;
  initialCategories?: any[];
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  opened,
  onClose,
  onFiltersChange,
  initialCategories,
}) => {
  const handleFilterUpdate = () => {
    onFiltersChange();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      className={styles.drawer}
      classNames={{
        content: styles.drawerContent,
        header: styles.drawerHeader,
        title: styles.drawerTitle,
        close: styles.drawerClose,
        body: styles.drawerBody,
      }}
      title="Фільтри"
      styles={{
        content: {
          borderRadius: 0,
          border: '0px solid var(--border-color)',
          borderBottom: 'none',
        },
        header: {
          borderBottom: '0px solid var(--border-color)',
          padding: 'var(--spacing-md)',
        },
        body: {
          padding: 'var(--spacing-md)',
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}>
      <CatalogFilters onFiltersChange={handleFilterUpdate} initialCategories={initialCategories} />
    </Drawer>
  );
};

// src/widgets/Header/PromoBanner/PromoBanner.tsx
'use client';

import { Group, Text, ActionIcon } from '@mantine/core';
import styles from './SearchSection.module.scss';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';

export function SearchSection() {
  return (
    <div className={styles.searchContainer}>
      <Group className={styles.search} justify="flex-end">
        <SearchInput />
      </Group>
      <div className={styles.searchContainer} />
    </div>
  );
}

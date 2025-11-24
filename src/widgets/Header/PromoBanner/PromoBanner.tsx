// src/widgets/Header/PromoBanner/PromoBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Group, Text, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { content } from '@/shared/config/content';
import styles from './PromoBanner.module.scss';

const STORAGE_KEY = 'promo-banner-closed';

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Перевіряємо чи баннер увімкнений та чи не закритий в цій сесії
    const isClosed = sessionStorage.getItem(STORAGE_KEY);
    if (content.header.promoBanner.enabled && !isClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isVisible) {
    return null;
  }

  const bannerText = content.header.promoBanner.text;

  return (
    <Group className={styles.promo}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marquee}>
          <Text className={styles.marqueeText}>{bannerText}</Text>
          <Text className={styles.marqueeText}>{bannerText}</Text>
          <Text className={styles.marqueeText}>{bannerText}</Text>
          <Text className={styles.marqueeText}>{bannerText}</Text>
          <Text className={styles.marqueeText}>{bannerText}</Text>
          <Text className={styles.marqueeText}>{bannerText}</Text>
        </div>
      </div>

      <ActionIcon
        variant="subtle"
        color="white"
        size="sm"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Закрити баннер">
        <IconX size={16} />
      </ActionIcon>
    </Group>
  );
}

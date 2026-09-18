// src/features/wishes/components/WishSheetResult.tsx
// Стан «надіслано» і рядок помилки шторки побажань — окремо, щоб WishSheet
// лишався в межах 150 рядків (CLAUDE.md).
'use client';

import { Button } from '@/shared/components/Button/Button';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import styles from './WishSheet.module.scss';

interface WishSentProps {
  onDone: () => void;
}

export const WishSent = ({ onDone }: WishSentProps) => (
  <div className={styles.sent} role="status">
    <p className={styles.sentTitle}>{content.wishes.sentTitle}</p>
    <p className={styles.hint}>{content.wishes.sentText}</p>
    <Button variant="primary" fullWidth onClick={onDone}>
      {content.wishes.done}
    </Button>
  </div>
);

export const WishError = () => (
  <p className={styles.error} role="alert">
    {content.wishes.errorText}
    <a href={siteConfig.socials.telegram} target="_blank" rel="noopener noreferrer">
      {content.wishes.errorLink}
    </a>
  </p>
);

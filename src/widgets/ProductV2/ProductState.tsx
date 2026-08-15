// src/widgets/ProductV2/ProductState.tsx
// Стани картки товару, поки немає даних. Головне правило: сторінка не має
// вічно писати «завантажуємо» — якщо запит упав, людина бачить це і має
// кнопку повтору (і вихід у каталог), а не нескінченний спінер.
'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import styles from './ProductV2.module.scss';

export const ProductSkeleton = () => (
  <div className={styles.skeleton} aria-busy="true" aria-label="Завантаження товару">
    <span className={styles.skeletonLine} style={{ width: '70%', height: 28 }} />
    <span className={styles.skeletonLine} style={{ width: '40%' }} />
    <span className={styles.skeletonLine} style={{ width: '35%', height: 34 }} />
    <span className={styles.skeletonLine} style={{ width: '100%', height: 48 }} />
  </div>
);

export const ProductError = ({ slug, onRetry }: { slug: string; onRetry: () => void }) => (
  <div className={styles.errorState} role="alert">
    <strong>Не вдалося завантажити товар</strong>
    <p>
      Перевірте зʼєднання або спробуйте ще раз. Якщо не допомагає — товару «{slug}» може вже не бути в
      каталозі.
    </p>
    <div className={styles.actionsRow}>
      <Button size="md" variant="primary" onClick={onRetry}>
        Спробувати ще раз
      </Button>
      <Link href="/catalog" className={styles.collectionLink}>
        До каталогу
      </Link>
    </div>
  </div>
);

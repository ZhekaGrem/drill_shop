// src/widgets/ProductV2/win98/ProductPhotos.tsx
// «Фото товару» у вікні товару (дизайн Windows 98). Каталог показує 3D-товари обертом (turntable), а сторінка — 3D-сценою, тож
// справжні фото товару інакше не побачити: кнопка під сценою відкриває вікно з ними (у Windows 98 — діалог із
// синьою смугою, стилі Mantine Modal у app/windows98.css).
'use client';

import { useState } from 'react';
import { Modal } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import type { ProductImage } from '@/shared/types';
import { StaticGallery } from '../StaticGallery';
import styles from './ProductV2Win98.module.scss';

// kind приходить з API (photo, render3d, turntable, turntable_poster), але в згенерованих типах його ще немає
type ApiImage = ProductImage & { kind?: string | null };

/** Лише фото товару: без 3D-рендерів і turntable-оберту */
export const productPhotos = (images: ApiImage[] = []): ApiImage[] =>
  images.filter((image) =>
    image.kind
      ? image.kind === 'photo'
      : !image.url?.includes('/turntable') && !image.url?.includes('/render3d')
  );

export const ProductPhotos = ({ images, name }: { images: ApiImage[]; name: string }) => {
  const [opened, setOpened] = useState(false);
  const photos = productPhotos(images);
  if (photos.length === 0) return null;

  return (
    <div className={styles.photoRow}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<IconPhoto size={18} stroke={1.5} />}
        aria-haspopup="dialog"
        onClick={() => setOpened(true)}>
        {photos.length > 1 ? `Фото товару (${photos.length})` : 'Фото товару'}
      </Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title={`Фото — ${name}`} size="lg" centered>
        <div className={styles.photoDialog}>
          <StaticGallery images={photos} name={name} />
        </div>
      </Modal>
    </div>
  );
};

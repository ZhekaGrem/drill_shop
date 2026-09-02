// src/widgets/ProductV2/StaticGallery.tsx
// Фолбек-галерея для товару, який не входить у жодну колекцію (немає 3D):
// та сама сцена й той самий ряд мініатюр, що в HeroVisual (--stage-size,
// spotlight/shadow, .thumb), тільки замість 3D-моделі — власні фото товару.
// Візуально товар без колекції не має виглядати інакше за товар із колекцією.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/shared/types';
import { getImageUrl } from '@/shared/utils/image';
import heroStyles from '@/widgets/HeroVisual/HeroVisual.module.scss';

export const StaticGallery = ({ images, name }: { images: ProductImage[]; name: string }) => {
  // Turntable-рендери — не фото товару (той самий фільтр, що на /catalog/[slug])
  const sorted = [...images]
    .filter((image) => !image.url?.includes('/turntable'))
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  const [active, setActive] = useState(0);
  const current = sorted[active] ?? sorted[0];

  if (!current) return null;

  return (
    <div className={heroStyles.visual}>
      <div className={heroStyles.stage}>
        <span className={heroStyles.spotlight} aria-hidden="true" />
        <span className={heroStyles.shadow} aria-hidden="true" />
        <Image
          src={getImageUrl(current.url || current.publicId)}
          alt={current.altText || name}
          width={880}
          height={880}
          priority
          className={heroStyles.still}
        />
      </div>

      {sorted.length > 1 && (
        <div className={heroStyles.designSwitcher} role="group" aria-label="Фото товару">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={heroStyles.thumb}
              aria-label={`Фото ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}>
              <Image src={getImageUrl(image.url || image.publicId)} alt="" width={56} height={56} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// src/widgets/ProductV2/ProductInfoGroups.tsx
// Те, що людина шукає ПЕРЕД покупкою: характеристики, розмірна сітка, доставка.
// Групи лежать на фоні сторінки (не в білій картці) — як на /catalog/[slug].
'use client';

import { useState } from 'react';
import { IconRuler } from '@tabler/icons-react';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { SizeGuideModal } from '@/shared/components/SizeGuideModal';
import type { Product } from '@/shared/types';
import styles from './ProductV2.module.scss';

// Людські назви ключів options (той самий словник, що на сторінці товару)
const OPTION_LABELS: Record<string, string> = {
  color: 'Колір',
  size: 'Розмір',
  material: 'Матеріал',
  brand: 'Бренд',
  taste: 'Смак',
  origin: 'Походження',
};

export const ProductInfoGroups = ({ product }: { product: Product }) => {
  const [guideOpened, setGuideOpened] = useState(false);

  const specs = Object.entries(product.options || {})
    .filter(([, value]) => value && String(value).trim())
    .map(([key, value]) => ({
      label: OPTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value),
    }));

  const categoriesWithGuide = (product.categories ?? [])
    .map((cat) => ({
      categoryName: cat.name,
      imageUrl: cat.sizeGuideImage || null,
      text: cat.sizeGuideText || null,
    }))
    .filter((cat) => cat.imageUrl || cat.text);

  return (
    <div className={styles.infoGroups}>
      {specs.length > 0 && (
        <ListGroup>
          {specs.map((spec) => (
            <ListRow key={spec.label} title={spec.label} value={spec.value} />
          ))}
        </ListGroup>
      )}

      {categoriesWithGuide.length > 0 && (
        <>
          <ListGroup>
            <ListRow
              onClick={() => setGuideOpened(true)}
              media={<IconRuler stroke={1.5} />}
              title="Розмірна сітка"
              hint="Заміри та посадка для цієї категорії"
            />
          </ListGroup>
          <SizeGuideModal
            opened={guideOpened}
            onClose={() => setGuideOpened(false)}
            categories={categoriesWithGuide}
          />
        </>
      )}

      <ServicesGroup />
    </div>
  );
};

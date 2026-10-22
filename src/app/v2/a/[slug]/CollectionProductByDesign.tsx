'use client';
// src/app/v2/a/[slug]/CollectionProductByDesign.tsx
// Сторінка товару в колекції за дизайном: Windows 98 — окремий дизайн зі своїми вікнами
// (widgets/ProductV2/win98/CollectionProductWin98.tsx), решта дизайнів рендерить незмінний CollectionProductClient.
import { useDesign } from '@/shared/hooks/useDesign';
import { CollectionProductWin98 } from '@/widgets/ProductV2/win98/CollectionProductWin98';
import CollectionProductClient from './CollectionProductClient';

export default function CollectionProductByDesign({ params }: { params: Promise<{ slug: string }> }) {
  const design = useDesign();
  return design === 'win98' ? (
    <CollectionProductWin98 params={params} />
  ) : (
    <CollectionProductClient params={params} />
  );
}

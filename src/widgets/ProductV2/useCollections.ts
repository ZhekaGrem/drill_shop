// src/widgets/ProductV2/useCollections.ts
// Живі колекції з GET /collections: герой головної і сторінка колекції
// працюють з тим, що лежить у БД (адмінка/Studio керують складом без деплою).
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { Design } from '@/widgets/HeroVisual/designs';
import type { CollectionDef, CollectionItem } from './collections';

// Дефолтна модель футболки живе у фронті (TshirtScene) — коли товар на ній,
// modelUrl не передаємо, щоб не вантажити другу копію того самого GLB
const DEFAULT_MODEL_PATH = '/3d/models/tshirt.glb';
const DEFAULT_FALLBACK = '/assets/img/tshirt-fallback.webp';

interface ApiImage {
  url: string;
  kind: string;
  isPrimary: boolean;
}

interface ApiCollectionProduct {
  slug: string;
  name: string;
  collectionOrder: number;
  model3dPath: string | null;
  texture3dUrl: string | null;
  switcherSwatch: string | null;
  images: ApiImage[];
}

interface ApiCollection {
  slug: string;
  title: string;
  description: string | null;
  archivedAt: string | null;
  labelText: string | null;
  labelColor: string | null;
  products: ApiCollectionProduct[];
}

const toDesign = (p: ApiCollectionProduct): Design => ({
  label: p.name,
  swatch: p.switcherSwatch ?? '#cccccc',
  // Постер сцени: 3D-рендер, а коли його ще нема — головне фото товару
  fallback:
    p.images.find((img) => img.kind === 'render3d')?.url ??
    p.images.find((img) => img.isPrimary)?.url ??
    p.images[0]?.url ??
    DEFAULT_FALLBACK,
  mapUrl: p.texture3dUrl ?? undefined,
  modelUrl: p.model3dPath && p.model3dPath !== DEFAULT_MODEL_PATH ? p.model3dPath : undefined,
});

const toCollectionDef = (c: ApiCollection): CollectionDef => {
  const items: CollectionItem[] = c.products.map((p) => ({
    key: p.slug,
    slug: p.slug,
    design: toDesign(p),
  }));
  return {
    key: c.slug,
    title: c.title,
    description: c.description ?? '',
    archivedAt: c.archivedAt,
    labelText: c.labelText ?? null,
    labelColor: c.labelColor ?? null,
    designs: Object.fromEntries(items.map((i) => [i.slug, i.design])),
    items,
    cover: items[0]?.design.fallback ?? DEFAULT_FALLBACK,
    href: items.length ? `/v2/a/${items[0].slug}` : '/catalog',
  };
};

export const useCollections = () =>
  useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ApiCollection[] }>('/collections');
      return data.data.map(toCollectionDef);
    },
    staleTime: 5 * 60_000,
  });

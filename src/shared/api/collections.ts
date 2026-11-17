// src/shared/api/collections.ts
// GET /collections — сирий склад колекцій. Живе окремо від хуків (useTurntables —
// 'use client'), бо серверний SSG каталогу теж мусить знати приховані товари.
import { apiClient } from './client';
import { isHiddenCollection } from '@/shared/config/hidden-collections';

export interface ApiCollectionImage {
  url: string;
  kind?: string;
}

export interface ApiCollectionProduct {
  slug: string;
  images: ApiCollectionImage[];
}

export interface ApiCollection {
  slug: string;
  products: ApiCollectionProduct[];
}

/** Спільний кеш TanStack Query для всіх проєкцій GET /collections */
export const RAW_COLLECTIONS_QUERY_KEY = ['collections-raw'] as const;

export const fetchRawCollections = async (): Promise<ApiCollection[]> => {
  const { data } = await apiClient.get<{ data: ApiCollection[] }>('/collections');
  return data.data;
};

/** Слаги товарів прихованих розділів (config/hidden-collections) */
export const toHiddenSlugs = (data: ApiCollection[]): Set<string> =>
  new Set(data.filter((c) => isHiddenCollection(c.slug)).flatMap((c) => c.products.map((p) => p.slug)));

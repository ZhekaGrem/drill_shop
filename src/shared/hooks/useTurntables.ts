'use client';
// Дві проєкції одного запиту GET /collections (спільний кеш ['collections-raw']):
//   useTurntables        — мапа slug → turntable-рендери для карток каталогу
//   useHiddenProductSlugs — слаги товарів прихованих розділів (їх картки
//                           каталог не показує; див. config/hidden-collections)
// Чому не з /products: лістовий формер бекенда віддає лише перші два фото
// (photoImages.slice(0, 2)) і губить kind; /collections — єдиний ендпоінт,
// що проносить kind і склад колекцій. Коли формер навчиться — це спроститься.
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { HIDDEN_COLLECTION_WORDMARK, isHiddenCollection } from '@/shared/config/hidden-collections';

export interface TurntableEntry {
  animated: string;
  poster: string;
}

interface ApiImage {
  url: string;
  kind?: string;
}

interface ApiCollectionProduct {
  slug: string;
  images: ApiImage[];
}

interface ApiCollection {
  slug: string;
  products: ApiCollectionProduct[];
}

const fetchRawCollections = async (): Promise<ApiCollection[]> => {
  const { data } = await apiClient.get<{ data: ApiCollection[] }>('/collections');
  return data.data;
};

const useRawCollections = <T>(select: (data: ApiCollection[]) => T) =>
  useQuery({
    queryKey: ['collections-raw'],
    queryFn: fetchRawCollections,
    staleTime: 5 * 60_000,
    select,
  });

const toTurntables = (data: ApiCollection[]): Record<string, TurntableEntry> => {
  const map: Record<string, TurntableEntry> = {};
  for (const c of data) {
    for (const p of c.products) {
      const animated = p.images.find((i) => i.kind === 'turntable')?.url;
      const poster = p.images.find((i) => i.kind === 'turntable_poster')?.url;
      if (animated && poster) map[p.slug] = { animated, poster };
    }
  }
  return map;
};

const toHiddenSlugs = (data: ApiCollection[]): Set<string> =>
  new Set(data.filter((c) => isHiddenCollection(c.slug)).flatMap((c) => c.products.map((p) => p.slug)));

// slug товару прихованого розділу → словомарка хедера («Олько»)
const toHiddenWordmarks = (data: ApiCollection[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const c of data) {
    const wordmark = HIDDEN_COLLECTION_WORDMARK[c.slug];
    if (!wordmark) continue;
    for (const p of c.products) map[p.slug] = wordmark;
  }
  return map;
};

export const useTurntables = () => useRawCollections(toTurntables);
export const useHiddenProductSlugs = () => useRawCollections(toHiddenSlugs);
export const useHiddenWordmarks = () => useRawCollections(toHiddenWordmarks);

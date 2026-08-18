'use client';
// Мапа slug → turntable-рендери (анімація + постер) для карток каталогу.
// Чому не з /products: лістовий формер бекенда віддає лише перші два фото
// (photoImages.slice(0, 2)) і губить kind, тож turntable-рядки беремо з
// /collections — єдиного ендпоінта, що проносить kind. Коли формер
// навчиться віддавати turntable-картинки в списку, цей хук стане зайвим.
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

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
  products: ApiCollectionProduct[];
}

export const useTurntables = () =>
  useQuery({
    queryKey: ['turntables'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ApiCollection[] }>('/collections');
      const map: Record<string, TurntableEntry> = {};
      for (const c of data.data) {
        for (const p of c.products) {
          const animated = p.images.find((i) => i.kind === 'turntable')?.url;
          const poster = p.images.find((i) => i.kind === 'turntable_poster')?.url;
          if (animated && poster) map[p.slug] = { animated, poster };
        }
      }
      return map;
    },
    staleTime: 5 * 60_000,
  });

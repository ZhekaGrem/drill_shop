// src/features/favorites/components/FavoritesList/FavoritesList.tsx
'use client';

import { Center, Loader, Stack } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';
import { useFavoritesStore } from '@/shared/stores/favorites';
import { Button } from '@/shared/components/Button/Button';
import Link from 'next/link';
import { useCart } from '@/features/cart/hooks/useCart';
import { showNotification } from '@/shared/utils/notifications';
import { Product } from '@/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/shared/components/EmptyState';
import { FavoriteItem } from '../FavoriteItem';

export const FavoritesList = () => {
  const { items, isInitialized, initialize, toggleFavorite } = useFavoritesStore();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  // Ініціалізуємо обране при першому рендері
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const { data: favoriteProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['favorites-details', Array.from(items).sort()],
    queryFn: async () => {
      if (items.size === 0) return [];

      const response = await apiClient.get('/profile/favorites', {
        params: { withProducts: true },
      });

      return response.data?.data || [];
    },
    enabled: isInitialized && items.size > 0,
    staleTime: 0,
  });

  const handleAddToCart = async (product: Product) => {
    if (!product.isInStock) return;

    setAddingItemId(product.id);
    try {
      await addItem(product.id, 1);
      showNotification({
        title: 'Товар додано',
        message: `${product.name} додано до кошика`,
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'Помилка',
        message: 'Не вдалося додати товар до кошика',
        color: 'red',
      });
    } finally {
      setAddingItemId(null);
    }
  };

  const handleRemoveFromFavorites = async (product: Product) => {
    await toggleFavorite(product);
    await queryClient.invalidateQueries({ queryKey: ['favorites'] });
    await queryClient.invalidateQueries({ queryKey: ['favorites-details'] });
  };

  if (!isInitialized || isLoading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        icon={IconHeart}
        title="Ваш список обраного порожній"
        description="Додайте товари до обраного, щоб швидко знаходити їх пізніше"
        primaryAction={
          <Link href="/catalog">
            <Button>Перейти до каталогу</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Stack gap={0}>
      {favoriteProducts.map((product: Product, index: number) => (
        <FavoriteItem
          key={product.id}
          product={product}
          onRemove={() => handleRemoveFromFavorites(product)}
          onAddToCart={() => handleAddToCart(product)}
          isFirst={index === 0}
          isAddingToCart={addingItemId === product.id}
        />
      ))}
    </Stack>
  );
};

// src/features/favorites/components/FavoritesList/FavoritesList.tsx
'use client';

import { Grid, Card, Image, Text, Group, Stack, Badge, Center, ActionIcon, Loader } from '@mantine/core';
import { IconTrash, IconHeart } from '@tabler/icons-react';
import { useFavoritesStore } from '@/shared/stores/favorites';
import { Button } from '@/shared/components/Button/Button';
import Link from 'next/link';
import { formatPrice } from '@/shared/utils/format';
import { useCart } from '@/features/cart/hooks/useCart';
import { notifications } from '@mantine/notifications';
import { Product } from '@/shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useEffect } from 'react';
import { EmptyState } from '@/shared/components/EmptyState';

export const FavoritesList = () => {
  const { items, isInitialized, initialize, toggleFavorite } = useFavoritesStore();
  const { addItem, isAddingItem } = useCart();
  const queryClient = useQueryClient();

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

      // Просто повертаємо products без синхронізації
      return response.data?.data || [];
    },
    enabled: isInitialized && items.size > 0,
    staleTime: 0, // Відключаємо кеш для миттєвого оновлення
  });

  const handleAddAllToCart = () => {
    let addedCount = 0;
    favoriteProducts.forEach((product) => {
      if (product && product.isInStock) {
        addItem(product.id, 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      notifications.show({
        title: 'Товари додано',
        message: `${addedCount} товар(ів) було додано до кошика.`,
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Неможливо додати',
        message: 'Обрані товари відсутні на складі.',
        color: 'orange',
      });
    }
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
    <>
      <Grid>
        {favoriteProducts.map((product: Product) => (
          <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Card.Section>
                <Link href={`/catalog/${product.slug}`}>
                  <Image
                    src={product.primaryImage?.url || '/assets/img/placeholder-product.jpeg'}
                    height={200}
                    alt={product.primaryImage?.altText || product.name}
                  />
                </Link>
              </Card.Section>

              <Stack gap="sm" mt="md" justify="space-between" style={{ height: 'calc(100% - 200px)' }}>
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Text
                      fw={500}
                      lineClamp={2}
                      component={Link}
                      href={`/catalog/${product.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.name}
                    </Text>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={async () => {
                        await toggleFavorite(product);
                        // Інвалідуємо всі favorites queries
                        await queryClient.invalidateQueries({ queryKey: ['favorites'] });
                        await queryClient.invalidateQueries({ queryKey: ['favorites-details'] });
                      }}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  <Badge color={product.isInStock ? 'green' : 'red'} variant="light" size="sm">
                    {product.isInStock ? 'В наявності' : 'Немає в наявності'}
                  </Badge>

                  <Group justify="space-between">
                    <Text fw={700} c="var(--primary)">
                      {formatPrice(product.price)}
                    </Text>
                    {product.comparePrice && (
                      <Text size="sm" td="line-through" c="dimmed">
                        {formatPrice(product.comparePrice)}
                      </Text>
                    )}
                  </Group>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
};

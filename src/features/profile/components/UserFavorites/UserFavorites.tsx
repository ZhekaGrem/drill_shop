'use client';

import { Stack, Title, Text, Center, Loader } from '@mantine/core';
import { FavoritesList } from '@/features/favorites/components/FavoritesList/FavoritesList';
import { useFavorites } from '@/features/favorites/hooks/favoritesHooks';

const UserFavorites = () => {
  const { data, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack>
      <div>
        <Title order={4} ta="start">Обрані товари</Title>
        {data && data.total > 0 && (
          <Text c="dimmed" size="sm" mt={4}>
            Всього: {data.total} {data.total === 1 ? 'товар' : data.total < 5 ? 'товари' : 'товарів'}
          </Text>
        )}
      </div>
      <FavoritesList />
    </Stack>
  );
};

export default UserFavorites;

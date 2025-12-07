import { Container, Title, Stack } from '@mantine/core';
import { FavoritesList } from '@/features/favorites/components/FavoritesList/FavoritesList';

const page = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={4} mb="xs" ta="start">
            Обрані товари
          </Title>
        </div>

        <FavoritesList />
      </Stack>
    </Container>
  );
};
export default page;

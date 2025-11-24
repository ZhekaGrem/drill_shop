import { Container, Title, Stack } from '@mantine/core';
import UserOrders from '@/features/profile/components/UserOrders/UserOrders';

const page = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs" ta="center">
            Мої замовлення
          </Title>
        </div>

        <UserOrders />
      </Stack>
    </Container>
  );
};
export default page;

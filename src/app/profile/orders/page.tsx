import { Title, Stack } from '@mantine/core';
import UserOrders from '@/features/profile/components/UserOrders/UserOrders';

const page = () => {
  return (
    <Stack gap="xl">
      <div>
        <Title order={4} ta="start">
          Мої замовлення
        </Title>
      </div>

      <UserOrders />
    </Stack>
  );
};
export default page;

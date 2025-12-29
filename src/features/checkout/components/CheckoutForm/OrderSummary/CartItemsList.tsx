import { Stack } from '@mantine/core';
import { CheckoutCard } from '../../CheckoutCard';

interface CartItemsListProps {
  items: any[];
}

export const CartItemsList = ({ items }: CartItemsListProps) => {
  return (
    <Stack gap={0}>
      {items.map((item) => (
        <CheckoutCard key={item.id} item={item} />
      ))}
    </Stack>
  );
};

// src/pages/User/UserOrders/UserOrders.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  Badge,
  Text,
  Stack,
  Title,
  Modal,
  Loader,
  Center,
  Paper,
  Group,
  Box,
  Divider,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { OrderWithRelations, OrderItem, OrderStatus } from '@/shared/types';
import { formatPrice } from '@/shared/utils/format';
import Link from 'next/link';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconPackage, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { useMediaQuery } from '@mantine/hooks';

import styles from './UserOrders.module.scss';
// Функція для отримання замовлень
const fetchOrders = async () => {
  const response = await apiClient.get('/profile/orders');
  return response.data.data;
};

const orderStatusUa: Record<OrderStatus, string> = {
  PENDING: 'Очікує підтвердження',
  CONFIRMED: 'Підтверджено',
  PROCESSING: 'В обробці',
  SHIPPED: 'Відправлено',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Скасовано',
  REFUNDED: 'Повернено',
};

const paymentStatusUa: Record<string, string> = {
  PENDING: 'Очікує оплати',
  PROCESSING: 'Обробляється',
  PAID: 'Оплачено',
  FAILED: 'Помилка',
  REFUNDED: 'Повернено',
  CANCELLED: 'Скасовано',
};

// Функція для отримання кольору Badge в залежності від статусу
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'CONFIRMED':
      return 'blue';
    case 'PROCESSING':
      return 'orange';
    case 'SHIPPED':
      return 'grape';
    case 'DELIVERED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    case 'REFUNDED':
      return 'gray';
    default:
      return 'gray';
  }
};

const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'PROCESSING':
      return 'blue';
    case 'PAID':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'REFUNDED':
    case 'CANCELLED':
      return 'gray';
    default:
      return 'gray';
  }
};

const OrderDetails = ({ order }: { order: OrderWithRelations | null }) => {
  if (!order) return null;

  return (
    <Stack>
      <Text>
        <b>Номер замовлення:</b> {order.orderNumber}
      </Text>
      <Text>
        <b>Дата:</b> {new Date(order.createdAt).toLocaleDateString()}
      </Text>
      <Text>
        <b>Статус:</b> {orderStatusUa[order.status as OrderStatus]}
      </Text>
      <Text>
        <b>Статус оплати:</b>{' '}
        <Badge color={getPaymentStatusColor(order.paymentStatus)}>
          {paymentStatusUa[order.paymentStatus] || order.paymentStatus}
        </Badge>
      </Text>
      <Text>
        <b>Сума:</b> {formatPrice(order.totalAmount)}
      </Text>
      <Title order={5} mt="md">
        Товари в замовленні:
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Назва</Table.Th>
            <Table.Th>Кількість</Table.Th>
            <Table.Th>Ціна</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {order.items?.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.productSnapshot.name}</Table.Td>
              <Table.Td>{item.quantity}</Table.Td>
              <Table.Td>{formatPrice(item.unitPrice)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

const UserOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<OrderWithRelations[]>({
    queryKey: ['user-orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return <Text color="red">Помилка завантаження замовлень.</Text>;
  }

  if (orders?.length === 0) {
    return (
      <EmptyState
        icon={IconPackage}
        title="У вас ще немає замовлень"
        description="Оформіть своє перше замовлення, щоб побачити історію покупок тут"
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
      <Stack gap="md">
        {isMobile ? (
          // Мобільний вигляд - картки в стилі Telegram Mini App
          <>
            {orders?.map((order) => (
              <Paper
                key={order.id}
                component={Link}
                href={`/orders/track/${order.orderNumber}`}
                shadow="xs"
                p="md"
                radius="md"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                styles={{
                  root: {
                    '&:active': {
                      transform: 'scale(0.98)',
                      backgroundColor: 'var(--mantine-color-gray-0)',
                    },
                  },
                }}>
                <Stack gap="xs">
                  {/* Верхня частина - номер та дата */}
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text size="sm" c="dimmed" fw={500}>
                        Замовлення
                      </Text>
                      <Text fw={600} size="lg">
                        {order.orderNumber}
                      </Text>
                    </Box>
                    <Text size="xs" c="dimmed">
                      {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </Group>

                  <Divider my={4} />

                  {/* Статуси */}
                  <Group gap="xs">
                    <Badge
                      size="md"
                      variant="light"
                      color={getStatusColor(order.status as OrderStatus)}
                      radius="sm">
                      {orderStatusUa[order.status as OrderStatus]}
                    </Badge>
                    <Badge
                      size="md"
                      variant="light"
                      color={getPaymentStatusColor(order.paymentStatus)}
                      radius="sm">
                      {paymentStatusUa[order.paymentStatus] || order.paymentStatus}
                    </Badge>
                  </Group>

                  {/* Нижня частина - сума та стрілка */}
                  <Group justify="space-between" align="center" mt={4}>
                    <Box>
                      <Text size="xs" c="dimmed">
                        Сума замовлення
                      </Text>
                      <Text size="xl" fw={700}>
                        {formatPrice(order.totalAmount)}
                      </Text>
                    </Box>
                    <IconChevronRight size={20} style={{ color: 'var(--mantine-color-gray-5)' }} />
                  </Group>
                </Stack>
              </Paper>
            ))}
          </>
        ) : (
          // Desktop вигляд - таблиця
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Номер</Table.Th>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Оплата</Table.Th>
                <Table.Th>Сума</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders?.map((order) => (
                <Table.Tr key={order.id} className={styles.wrapperTable}>
                  <Table.Td>{order.orderNumber}</Table.Td>
                  <Table.Td>{new Date(order.createdAt).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(order.status as OrderStatus)}>
                      {orderStatusUa[order.status as OrderStatus]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getPaymentStatusColor(order.paymentStatus)}>
                      {paymentStatusUa[order.paymentStatus] || order.paymentStatus}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatPrice(order.totalAmount)}</Table.Td>
                  <Table.Td className={styles.tableBtn}>
                    <Link href={`/orders/track/${order.orderNumber}`}>Деталі</Link>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal
        opened={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Деталі замовлення"
        size="lg">
        <OrderDetails order={selectedOrder} />
      </Modal>
    </>
  );
};

export default UserOrders;

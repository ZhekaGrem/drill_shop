// app/telegram/orders/track/[orderNumber]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Timeline,
  Badge,
  Loader,
  Alert,
  Center,
} from '@mantine/core';
import { IconPackage, IconTruck, IconCheck, IconClock, IconX, IconAlertCircle } from '@tabler/icons-react';
import { apiClient } from '@/shared/api';
import { OrderStatus, PaymentStatus } from '@/shared/types';
import { formatPrice } from '@/shared/utils/format';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';

// API response type
interface OrderTrackingResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: {
    email: string;
    phone: string;
    name: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image: string;
  }>;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    totalAmount: number;
  };
  paymentMethod: string;
  estimatedDelivery: string;
  createdAt: string;
  notes: string | null;
}

const fetchOrderByNumber = async (orderNumber: string): Promise<OrderTrackingResponse> => {
  const response = await apiClient.get(`/orders/track/${orderNumber}`);
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

const paymentStatusUa: Record<PaymentStatus, string> = {
  PENDING: 'Очікує оплати',
  PAID: 'Оплачено',
  FAILED: 'Помилка оплати',
  REFUNDED: 'Повернено',
  PARTIALLY_PAID: 'Частково оплачено',
};

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

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'PAID':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'FAILED':
      return 'red';
    case 'REFUNDED':
      return 'gray';
    case 'PARTIALLY_PAID':
      return 'orange';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return <IconClock size={16} />;
    case 'CONFIRMED':
      return <IconCheck size={16} />;
    case 'PROCESSING':
      return <IconPackage size={16} />;
    case 'SHIPPED':
      return <IconTruck size={16} />;
    case 'DELIVERED':
      return <IconCheck size={16} />;
    case 'CANCELLED':
      return <IconX size={16} />;
    case 'REFUNDED':
      return <IconX size={16} />;
    default:
      return <IconClock size={16} />;
  }
};

const getTimelineActive = (status: OrderStatus): number => {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PROCESSING':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    case 'CANCELLED':
      return 0;
    case 'REFUNDED':
      return 0;
    default:
      return 0;
  }
};

const TelegramOrderTrackingPage: React.FC = () => {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order-tracking', orderNumber],
    queryFn: () => fetchOrderByNumber(orderNumber),
    enabled: !!orderNumber,
    retry: 1,
  });

  if (!orderNumber) {
    return (
      <Container size="sm" py="md">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
          Невірний номер замовлення
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container size="sm" py="md">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Завантаження інформації про замовлення...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="md">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
          Замовлення з номером <strong>{orderNumber}</strong> не знайдено. Перевірте правильність номера.
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container size="sm" py="md">
        <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Не знайдено">
          Замовлення не знайдено
        </Alert>
      </Container>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container size="md" py="md">
      <Stack gap="md">
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            {/* Order header */}
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Title order={3}>Замовлення {order.orderNumber}</Title>
                <Text c="dimmed" size="sm">
                  Створено:{' '}
                  {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text c="dimmed" size="sm">
                  Очікувана доставка: {new Date(order.estimatedDelivery).toLocaleDateString('uk-UA')}
                </Text>
              </Stack>

              <Badge color={getStatusColor(order.status)} size="lg" leftSection={getStatusIcon(order.status)}>
                {orderStatusUa[order.status]}
              </Badge>
            </Group>

            {/* Order summary */}
            <Paper p="md" withBorder radius="md" bg="gray.0">
              <Group justify="space-between">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Загальна сума
                  </Text>
                  <Text fw={700} size="lg">
                    {formatPrice(order.totals.totalAmount)}
                  </Text>
                </Stack>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Статус оплати
                  </Text>
                  <Badge color={getPaymentStatusColor(order.paymentStatus)}>
                    {paymentStatusUa[order.paymentStatus]}
                  </Badge>
                </Stack>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Кількість товарів
                  </Text>
                  <Text fw={500}>{totalItems} шт.</Text>
                </Stack>
              </Group>
            </Paper>

            {/* Customer info */}
            <Paper p="md" withBorder radius="md">
              <Stack gap="md">
                <Title order={5}>Інформація про замовлення</Title>
                <Group>
                  <Stack gap="xs" flex={1}>
                    <Text size="sm" c="dimmed">
                      Одержувач
                    </Text>
                    <Text fw={500}>{order.customer.name}</Text>
                    {order.customer.phone && <Text size="sm">{order.customer.phone}</Text>}
                    {order.customer.email && <Text size="sm">{order.customer.email}</Text>}
                  </Stack>

                  <Stack gap="xs" flex={1}>
                    <Text size="sm" c="dimmed">
                      Адреса доставки
                    </Text>
                    <Text size="sm">{order.shippingAddress.city}</Text>
                    {order.shippingAddress.city?.trim().toLowerCase() !==
                      order.shippingAddress.address1?.trim().toLowerCase() && (
                      <Text size="sm">{order.shippingAddress.address1}</Text>
                    )}
                  </Stack>
                </Group>
              </Stack>
            </Paper>

            {/* Order items */}
            <Paper p="md" withBorder radius="md">
              <Stack gap="md">
                <Title order={5}>Товари в замовленні</Title>
                {order.items.map((item) => (
                  <Group key={item.id} gap="md">
                    <CloudinaryImage
                      src={item.image || '/assets/img/placeholder-product.jpg'}
                      alt={item.productName}
                      width={60}
                      height={60}
                    />
                    <Stack gap="xs" flex={1}>
                      <Text fw={500} size="sm">
                        {item.productName}
                      </Text>
                      <Group gap="md">
                        <Text size="xs" c="dimmed">
                          Кількість: {item.quantity}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Ціна: {formatPrice(item.unitPrice)}
                        </Text>
                        <Text fw={500} size="sm">
                          Сума: {formatPrice(item.totalPrice)}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>
                ))}
              </Stack>
            </Paper>

            {/* Order timeline */}
            <Stack gap="md">
              <Title order={5}>Статус замовлення</Title>
              <Timeline active={getTimelineActive(order.status)} bulletSize={24}>
                <Timeline.Item bullet={<IconClock size={12} />} title="Замовлення створено">
                  <Text c="dimmed" size="sm">
                    {new Date(order.createdAt).toLocaleString('uk-UA')}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconCheck size={12} />} title="Підтверджено">
                  <Text c="dimmed" size="sm">
                    {order.status !== 'PENDING' ? 'Замовлення підтверджено менеджером' : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconPackage size={12} />} title="В обробці">
                  <Text c="dimmed" size="sm">
                    {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                      ? 'Замовлення збирається на складі'
                      : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconTruck size={12} />} title="Відправлено">
                  <Text c="dimmed" size="sm">
                    {['SHIPPED', 'DELIVERED'].includes(order.status)
                      ? 'Замовлення передано перевізнику'
                      : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconCheck size={12} />} title="Доставлено">
                  <Text c="dimmed" size="sm">
                    {order.status === 'DELIVERED' ? 'Замовлення успішно доставлено' : 'Очікується'}
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Stack>

            {/* Order notes */}
            {order.notes && (
              <Stack gap="xs">
                <Title order={5}>Коментар до замовлення</Title>
                <Text size="sm">{order.notes}</Text>
              </Stack>
            )}

            {/* Order totals */}
            <Paper p="md" withBorder radius="md" bg="gray.0">
              <Stack gap="xs">
                <Title order={5}>Деталі оплати</Title>

                {order.totals.discountAmount > 0 && (
                  <Group justify="space-between">
                    <Text size="sm">Знижка:</Text>
                    <Text size="sm" c="green">
                      -{formatPrice(order.totals.discountAmount)}
                    </Text>
                  </Group>
                )}
                {order.totals.shippingAmount > 0 && (
                  <Group justify="space-between">
                    <Text size="sm">Доставка:</Text>
                    <Text size="sm">{formatPrice(order.totals.shippingAmount)}</Text>
                  </Group>
                )}
                <Group justify="space-between" style={{ borderTop: '1px solid #dee2e6', paddingTop: 8 }}>
                  <Text fw={700}>До сплати:</Text>
                  <Text fw={700} size="lg">
                    {formatPrice(order.totals.totalAmount)}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default TelegramOrderTrackingPage;

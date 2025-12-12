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
import styles from './orderTracking.module.scss';

// API response type matching actual structure
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

// Fetch order by tracking number
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

// Calculate timeline position based on order status
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

const OrderTrackingPage: React.FC = () => {
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

  // Validate order number
  if (!orderNumber) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
          Невірний номер замовлення
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Завантаження інформації про замовлення...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
          Замовлення з номером <strong>{orderNumber}</strong> не знайдено. Перевірте правильність номера.
        </Alert>
      </Container>
    );
  }

  // No data state
  if (!order) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Не знайдено">
          Замовлення не знайдено
        </Alert>
      </Container>
    );
  }

  // Calculate total items quantity
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container size="lg" py={80}>
      <Stack gap="xl">
        <Title order={1} className={styles.pageTitle}>
          ЗАМОВЛЕННЯ {order.orderNumber}
        </Title>

        <Paper className={styles.orderCard}>
          <Stack gap="lg">
            <Paper className={styles.summaryCard}>
              <Group justify="space-between">

                <Stack gap="xs">
                  <Text className={styles.label}>Обробка замовлення</Text>
                  <Badge
                    color={getStatusColor(order.status)}
                    size="lg"
                    leftSection={getStatusIcon(order.status)}>
                    {orderStatusUa[order.status]}
                  </Badge>
                </Stack>
                <Stack gap="xs">
                  <Text className={styles.label}>Статус оплати</Text>
                  <Badge color={getPaymentStatusColor(order.paymentStatus)} size="lg">
                    {paymentStatusUa[order.paymentStatus]}
                  </Badge>
                </Stack>


                <Stack gap="xs">
                  <Text className={styles.label}>
                    Створено:{' '}
                    {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text className={styles.label}>
                    Очікувана доставка: {new Date(order.estimatedDelivery).toLocaleDateString('uk-UA')}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            <Paper className={styles.infoCard}>
              <Stack gap="md" className={styles.infoCard}>
                <Title order={3} className={styles.sectionTitle}>
                  ІНФОРМАЦІЯ ПРО ЗАМОВЛЕННЯ
                </Title>
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

            <Paper className={styles.infoCard}>
              <Stack gap="xs">
                <Title order={3} className={styles.sectionTitle}>
                  ТОВАРИ В ЗАМОВЛЕННІ
                </Title>
                {order.items.map((item) => (
                  <Group key={item.id} className={styles.card}>
                    <Stack gap="xs" flex={1}>
                      <Text fw={500}>{item.productName}</Text>
                      <Group gap="md">
                        <Text size="sm" c="dimmed">
                          Кількість: {item.quantity}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Ціна: {formatPrice(item.unitPrice)}
                        </Text>
                        <Text fw={500}>Сума: {formatPrice(item.totalPrice)}</Text>
                      </Group>
                    </Stack>
                    <CloudinaryImage
                      src={item.image || '/assets/img/placeholder-product.jpg'}
                      alt={item.productName}
                      width={110}
                      height={110}
                      className={styles.img}
                    />
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Paper className={styles.summaryCard}>
              <Group justify="space-between">

                <Stack gap="xs">
                  <Text className={styles.label}>Кількість товарів</Text>
                  <Text fw={500} size="lg">
                    {totalItems} шт.
                  </Text>
                </Stack>
                <Stack gap="xs">
                  <Text className={styles.label}>Загальна сума</Text>
                  <Text fw={700} size="xl" className={styles.price}>
                    {formatPrice(order.totals.totalAmount)}
                  </Text>
                </Stack>




              </Group>
            </Paper>

            <Stack gap="md">
              <Title order={3} className={styles.sectionTitle}>
                СТАТУС ЗАМОВЛЕННЯ
              </Title>
              <Timeline active={getTimelineActive(order.status)} bulletSize={34}>
                <Timeline.Item bullet={<IconClock size={22} />} title="Замовлення створено">
                  <Text c="dimmed" size="sm">
                    {new Date(order.createdAt).toLocaleString('uk-UA')}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconCheck size={22} />} title="Підтверджено">
                  <Text c="dimmed" size="sm">
                    {order.status !== 'PENDING' ? 'Замовлення підтверджено менеджером' : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconPackage size={22} />} title="В обробці">
                  <Text c="dimmed" size="sm">
                    {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                      ? 'Замовлення збирається на складі'
                      : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconTruck size={22} />} title="Відправлено">
                  <Text c="dimmed" size="sm">
                    {['SHIPPED', 'DELIVERED'].includes(order.status)
                      ? 'Замовлення передано перевізнику'
                      : 'Очікується'}
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={<IconCheck size={22} />} title="Доставлено">
                  <Text c="dimmed" size="sm">
                    {order.status === 'DELIVERED' ? 'Замовлення успішно доставлено' : 'Очікується'}
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Stack>

            {order.notes && (
              <Stack gap="xs">
                <Title order={3} className={styles.sectionTitle}>
                  КОМЕНТАР ДО ЗАМОВЛЕННЯ
                </Title>
                <Text>{order.notes}</Text>
              </Stack>
            )}

            <Paper className={styles.totalsCard}>
              <Stack gap="md">
                <Title order={3} className={styles.sectionTitle}>
                  ДЕТАЛІ ОПЛАТИ
                </Title>

                {order.totals.discountAmount > 0 && (
                  <Group justify="space-between" className={styles.totalRow}>
                    <Text>Знижка:</Text>
                    <Text c="green">-{formatPrice(order.totals.discountAmount)}</Text>
                  </Group>
                )}
                {order.totals.shippingAmount > 0 && (
                  <Group justify="space-between" className={styles.totalRow}>
                    <Text>Доставка:</Text>
                    <Text>{formatPrice(order.totals.shippingAmount)}</Text>
                  </Group>
                )}
                <Group justify="space-between" className={styles.totalRowFinal}>
                  <Text fw={700} size="lg">
                    До сплати:
                  </Text>
                  <Text fw={700} size="xl" className={styles.price}>
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

export default OrderTrackingPage;

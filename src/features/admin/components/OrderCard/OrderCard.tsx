// features/admin/components/OrderCard/OrderCard.tsx - FIXED DATA MAPPING
import { Card, Group, Text, Badge, Button, Stack, Select } from '@mantine/core';
import { formatPrice } from '@/shared/utils/format';
import { useState } from 'react';
import { formatDate } from '@/shared/utils/format';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: any;
  onStatusUpdate: (orderId: string, status: string, comment?: string) => void;
  onPaymentStatusUpdate?: (orderId: string, paymentStatus: string, comment?: string) => void;
  onEdit: (order: any) => void;
  onView: (order: any) => void;
}

export function OrderCard({ order, onStatusUpdate, onPaymentStatusUpdate, onEdit, onView }: OrderCardProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'yellow',
      CONFIRMED: 'blue',
      PROCESSING: 'cyan',
      SHIPPED: 'orange',
      DELIVERED: 'green',
      CANCELLED: 'red',
      REFUNDED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Очікує',
      CONFIRMED: 'Підтверджено',
      PROCESSING: 'Обробка',
      SHIPPED: 'Відправлено',
      DELIVERED: 'Доставлено',
      CANCELLED: 'Скасовано',
      REFUNDED: 'Повернено',
    };
    return labels[status] || status;
  };

  const canEdit =
    ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && order.paymentStatus !== 'PAID';

  const handleOrderEditClick = () => {
    router.push(`/admin/orders/${order.id}/edit`);
  };

  const handleStatusChange = async () => {
    if (selectedStatus !== order.status) {
      setIsUpdatingStatus(true);
      await onStatusUpdate(order.id, selectedStatus, `Статус змінено з ${order.status} на ${selectedStatus}`);
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async () => {
    if (selectedPaymentStatus !== order.paymentStatus && onPaymentStatusUpdate) {
      setIsUpdatingPayment(true);
      await onPaymentStatusUpdate(
        order.id,
        selectedPaymentStatus,
        `Статус оплати змінено з ${order.paymentStatus} на ${selectedPaymentStatus}`
      );
      setIsUpdatingPayment(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'yellow',
      PAID: 'green',
      FAILED: 'red',
      REFUNDED: 'gray',
      PARTIALLY_PAID: 'orange',
    };
    return colors[status] || 'gray';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Очікує оплати',
      PAID: 'Оплачено',
      FAILED: 'Помилка оплати',
      REFUNDED: 'Повернено',
      PARTIALLY_PAID: 'Частково оплачено',
    };
    return labels[status] || status;
  };

  // Extract customer name properly
  const getCustomerName = () => {
    if (order.customer?.name) {
      return order.customer.name; // API format: customer.name
    }

    // Fallback for other formats
    if (order.user) {
      return `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
    }

    if (order.guestFirstName || order.guestLastName) {
      return `${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim();
    }

    return order.guestEmail || 'Гість';
  };

  // Extract customer email/phone
  const getCustomerEmail = () => {
    return order.customer?.email || order.guestEmail || order.user?.email;
  };

  const getCustomerPhone = () => {
    return order.customer?.phone || order.guestPhone || order.user?.phone;
  };

  // Extract address properly
  const getShippingAddress = () => {
    const addr = order.shippingAddress;
    if (!addr) return null;

    // Handle different address formats
    if (typeof addr === 'string') {
      try {
        return JSON.parse(addr);
      } catch {
        return null;
      }
    }

    return addr;
  };

  const customerName = getCustomerName();
  const customerEmail = getCustomerEmail();
  const customerPhone = getCustomerPhone();
  const shippingAddress = getShippingAddress();

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Group gap="xs">
            <Text fw={600} size="lg">
              #{order.orderNumber}
            </Text>
            <Badge color={getStatusColor(order.status)} variant="light">
              {getStatusLabel(order.status)}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {formatDate(order.createdAt)}
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="xl" fw={700} c="blue">
            {/* Use totals.totalAmount from API response */}
            {formatPrice(order.totals?.totalAmount || order.totalAmount)}
          </Text>
          <Badge color={getPaymentStatusColor(order.paymentStatus)} variant="light" size="sm">
            {getPaymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
      </Group>

      <Stack gap="xs" my="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Клієнт:
          </Text>
          <Text size="sm" fw={500}>
            {customerName}
          </Text>
        </Group>

        {customerEmail && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Email:
            </Text>
            <Text size="sm">{customerEmail}</Text>
          </Group>
        )}

        {customerPhone && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Телефон:
            </Text>
            <Text size="sm">{customerPhone}</Text>
          </Group>
        )}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Товарів:
          </Text>
          <Text size="sm">
            {/* Use totals.itemsCount from API response */}
            {order.totals?.itemsCount || order.items?.length || 0} шт
          </Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Гість:
          </Text>
          <Text size="sm">{order.customer?.isGuest ? 'Так' : 'Ні'}</Text>
        </Group>

        {shippingAddress && (
          <Group justify="space-between" align="flex-start">
            <Text size="sm" c="dimmed">
              Адреса:
            </Text>
            <Text size="sm" style={{ textAlign: 'right', maxWidth: '60%' }}>
              {shippingAddress.city && shippingAddress.address1
                ? `${shippingAddress.city}, ${shippingAddress.address1}`
                : shippingAddress.city || shippingAddress.address1 || 'Не вказано'}
            </Text>
          </Group>
        )}
      </Stack>

      <Stack gap="xs">
        <Group gap="xs">
          <Select
            size="xs"
            label="Статус замовлення"
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value || order.status)}
            data={[
              { value: 'PENDING', label: 'Очікує' },
              { value: 'CONFIRMED', label: 'Підтверджено' },
              { value: 'PROCESSING', label: 'Обробка' },
              { value: 'SHIPPED', label: 'Відправлено' },
              { value: 'DELIVERED', label: 'Доставлено' },
              { value: 'CANCELLED', label: 'Скасовано' },
              { value: 'REFUNDED', label: 'Повернено' },
            ]}
            style={{ flex: 1 }}
          />
          <Button
            size="xs"
            loading={isUpdatingStatus}
            disabled={selectedStatus === order.status}
            onClick={handleStatusChange}
            style={{ marginTop: '24px' }}>
            Оновити
          </Button>
        </Group>

        <Group gap="xs">
          <Select
            size="xs"
            label="Статус оплати"
            value={selectedPaymentStatus}
            onChange={(value) => setSelectedPaymentStatus(value || order.paymentStatus)}
            data={[
              { value: 'PENDING', label: 'Очікує оплати' },
              { value: 'PAID', label: 'Оплачено' },
              { value: 'FAILED', label: 'Помилка оплати' },
              { value: 'REFUNDED', label: 'Повернено' },
              { value: 'PARTIALLY_PAID', label: 'Частково оплачено' },
            ]}
            style={{ flex: 1 }}
          />
          <Button
            size="xs"
            loading={isUpdatingPayment}
            disabled={selectedPaymentStatus === order.paymentStatus || !onPaymentStatusUpdate}
            onClick={handlePaymentStatusChange}
            style={{ marginTop: '24px' }}>
            Оновити
          </Button>
        </Group>

        <Group gap="xs" justify="flex-end">
          <Button size="xs" variant="light" onClick={() => onView(order)}>
            Деталі
          </Button>
          {canEdit && (
            <Button size="xs" variant="light" color="orange" onClick={handleOrderEditClick}>
              Редагувати
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

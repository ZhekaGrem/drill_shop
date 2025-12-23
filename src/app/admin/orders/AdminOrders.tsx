// src/app/admin/orders/AdminOrders.tsx - FIXED DATA ACCESS
'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from '@/features/admin/hooks/adminHooks';
import {
  Card,
  Text,
  Group,
  Badge,
  LoadingOverlay,
  Alert,
  TextInput,
  Select,
  Grid,
  Button,
  Stack,
  Modal,
  Table,
  Divider,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { formatPrice } from '@/shared/utils/format';
import { OrderCard } from '@/features/admin/components/OrderCard/OrderCard';

export default function OrdersManagement() {
  const { isAdmin, isManager } = useAdminGuard();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    limit: 20,
    offset: 0,
  });

  const { data: ordersData, isLoading, error } = useAdminOrders(filters);

  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  if (!isAdmin && !isManager) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          У вас немає прав для управління замовленнями
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження замовлень: {error.message}
      </Alert>
    );
  }

  // FIXED: Access data properly from API response
  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination || ordersData?.meta;

  const handleOrderEdit = (order: any) => {
    setSelectedOrder(order);
    open();
  };

  const handleStatusUpdate = async (orderId: string, status: string, comment?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status,
        comment,
      });
    } catch (error) {
      console.error('Status update error:', error);
      alert('Помилка при оновленні статусу замовлення');
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, paymentStatus: string, comment?: string) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        id: orderId,
        paymentStatus,
        comment,
      });
    } catch (error) {
      console.error('Payment status update error:', error);
      alert('Помилка при оновленні статусу оплати');
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  };

  const handleStatusFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, status: value || '', offset: 0 }));
  };

  const handlePaymentStatusFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, paymentStatus: value || '', offset: 0 }));
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>
            Управління замовленнями
          </Text>
          <Text c="dimmed">Обробка та відстеження замовлень клієнтів</Text>
        </div>

        <Group>
          <Badge color="blue" variant="light">
            Всього: {pagination?.total || 0}
          </Badge>
        </Group>
      </Group>

      {/* Debug info */}

      {/* Filters */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Пошук за номером або клієнтом..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Статус замовлення"
              data={[
                { value: '', label: 'Всі статуси' },
                { value: 'PENDING', label: 'Очікує' },
                { value: 'CONFIRMED', label: 'Підтверджено' },
                { value: 'PROCESSING', label: 'Обробка' },
                { value: 'SHIPPED', label: 'Відправлено' },
                { value: 'DELIVERED', label: 'Доставлено' },
                { value: 'CANCELLED', label: 'Скасовано' },
              ]}
              value={filters.status}
              onChange={handleStatusFilter}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Статус платежу"
              data={[
                { value: '', label: 'Всі статуси' },
                { value: 'PENDING', label: 'Очікує оплати' },
                { value: 'PAID', label: 'Оплачено' },
                { value: 'FAILED', label: 'Помилка оплати' },
                { value: 'REFUNDED', label: 'Повернено' },
              ]}
              value={filters.paymentStatus}
              onChange={handlePaymentStatusFilter}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Orders List */}
      <Stack gap="md">
        {orders.map((order: any) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusUpdate={handleStatusUpdate}
            onPaymentStatusUpdate={handlePaymentStatusUpdate}
            onEdit={handleOrderEdit}
            onView={(order) => {
              setSelectedOrder(order);
              open();
            }}
          />
        ))}

        {orders.length === 0 && !isLoading && (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <div style={{ textAlign: 'center' }}>
              <Text c="dimmed" size="lg">
                Замовлення не знайдені
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                Спробуйте змінити фільтри пошуку
              </Text>
            </div>
          </Card>
        )}
      </Stack>

      {/* Simple Pagination */}
      {pagination && pagination.total > filters.limit && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Group justify="center">
            <Button
              variant="light"
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }>
              Попередня
            </Button>
            <Text size="sm">
              Сторінка {pagination.page || 1} з {pagination.totalPages || 1}({filters.offset + 1}-
              {Math.min(filters.offset + filters.limit, pagination.total)} з {pagination.total})
            </Text>
            <Button
              variant="light"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }>
              Наступна
            </Button>
          </Group>
        </Card>
      )}

      {/* Order Details Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={selectedOrder ? `Замовлення ${selectedOrder.orderNumber}` : 'Деталі замовлення'}
        size="xl">
        {selectedOrder && (
          <Stack gap="md">
            {/* Customer & Summary Info */}
            <Group justify="space-between">
              <div>
                <Text fw={600}>Клієнт</Text>
                <Text>{selectedOrder.customer?.name || 'Невідомо'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedOrder.customer?.email}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedOrder.customer?.phone}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={600}>Загальна сума</Text>
                <Text size="xl" fw={700} c="blue">
                  {formatPrice(selectedOrder.totals?.totalAmount || selectedOrder.totalAmount)}
                </Text>
                <Badge color={selectedOrder.customer?.isGuest ? 'orange' : 'green'} size="sm">
                  {selectedOrder.customer?.isGuest ? 'Гість' : 'Зареєстрований'}
                </Badge>
              </div>
            </Group>

            <Divider />

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <>
                <div>
                  <Text fw={600} mb="xs">
                    Адреса доставки
                  </Text>
                  <Paper p="sm" withBorder>
                    <Stack gap="xs">
                      {selectedOrder.shippingAddress.fullName && (
                        <Text size="sm">
                          <Text component="span" fw={500}>
                            Отримувач:
                          </Text>{' '}
                          {selectedOrder.shippingAddress.fullName}
                        </Text>
                      )}
                      {selectedOrder.shippingAddress.phone && (
                        <Text size="sm">
                          <Text component="span" fw={500}>
                            Телефон:
                          </Text>{' '}
                          {selectedOrder.shippingAddress.phone}
                        </Text>
                      )}
                      <Text size="sm">
                        <Text component="span" fw={500}>
                          Адреса:
                        </Text>{' '}
                        {[
                          selectedOrder.shippingAddress.street,
                          selectedOrder.shippingAddress.city,
                          selectedOrder.shippingAddress.state,
                          selectedOrder.shippingAddress.postalCode,
                          selectedOrder.shippingAddress.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </Stack>
                  </Paper>
                </div>
                <Divider />
              </>
            )}

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <Text fw={600} mb="xs">
                  Товари ({selectedOrder.items.length})
                </Text>
                <Paper p="sm" withBorder>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Назва</Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Кількість</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Ціна</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Сума</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedOrder.items.map((item: any) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <Text size="sm">{item.productSnapshot?.name || item.product?.name || 'Без назви'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {item.productSnapshot?.sku || item.product?.sku || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text size="sm">{item.quantity}</Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text size="sm">{formatPrice(item.unitPrice)}</Text>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text size="sm" fw={500}>
                              {formatPrice(item.totalPrice)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Paper>
              </div>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={close}>
                Закрити
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}

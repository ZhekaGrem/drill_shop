// src/app/admin/orders/[id]/edit/OrderEditPage.tsx - Refactored with FSD
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Group,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  LoadingOverlay,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { OrderStatus } from '@/shared/types/generated.types';
import { useModifyOrder } from '@/features/admin/hooks/useModifyOrder';
import { useOrderEdit } from '@/features/admin/hooks/useOrderEdit';
import { useOrderItems } from '@/features/admin/hooks/useOrderItems';
import { useOrderCalculations } from '@/features/admin/hooks/useOrderCalculations';
import { CustomerInfoSection } from '@/features/admin/components/OrderEdit/sections/CustomerInfoSection';
import { ShippingAddressSection } from '@/features/admin/components/OrderEdit/sections/ShippingAddressSection';
import { OrderNotesSection } from '@/features/admin/components/OrderEdit/sections/OrderNotesSection';
import { OrderItemsManager } from '@/features/admin/components/OrderEdit/OrderItemsManager/OrderItemsManager';

// Validation schema
const editOrderSchema = z.object({
  guestEmail: z.string().email().optional().or(z.literal('')),
  guestPhone: z.string().optional(),
  guestFirstName: z.string().min(1, 'First name required'),
  guestLastName: z.string().min(1, 'Last name required'),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name required'),
    street: z.string(),
    city: z.string().min(1, 'City required'),
    postalCode: z.string(),
    country: z.string().min(1, 'Country required'),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  modificationReason: z.string().optional(),
});

type EditOrderForm = z.infer<typeof editOrderSchema>;

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const form = useForm<EditOrderForm>({
    resolver: zodResolver(editOrderSchema),
  });

  const modifyOrder = useModifyOrder();

  // Використовуємо hooks для логіки
  const { order, items, setItems, paymentStatus, setPaymentStatus, availableProducts, isLoading } =
    useOrderEdit(id, form);

  const { newItems, setNewItems, updateItemQuantity, updateItemPrice, removeItem, handleAddProduct } =
    useOrderItems();

  const { calculateTotals } = useOrderCalculations();

  // Check if order can be edited
  const canEdit =
    order && [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(order.status);

  // Calculate totals
  const totals = order ? calculateTotals(items, newItems, order) : { subtotal: 0, totalAmount: 0 };

  // Submit form
  const onSubmit = async (data: EditOrderForm) => {
    if (!order) return;

    try {
      const modificationData = {
        ...data,
        shippingAddress: {
          ...data.shippingAddress,
          street: data.shippingAddress.street || '',
          postalCode: data.shippingAddress.postalCode || '',
        },
        addItems:
          newItems.length > 0
            ? newItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              }))
            : undefined,
        removeItemIds: items.filter((item) => item.isRemoved && item.id).map((item) => item.id),
        updateItems:
          items.length > 0
            ? items
                .filter((item) => item.isModified && !item.isRemoved)
                .map((item) => ({
                  itemId: item.id,
                  quantity: item.newQuantity,
                  unitPrice: item.newUnitPrice,
                }))
            : undefined,
      };

      // Видалити undefined поля
      Object.keys(modificationData).forEach((key) => {
        if (modificationData[key as keyof typeof modificationData] === undefined) {
          delete modificationData[key as keyof typeof modificationData];
        }
      });

      await modifyOrder.mutateAsync({
        orderId: order.id,
        data: modificationData,
      });

      router.push(`/admin/orders`);
    } catch (error) {
      console.error('❌ Failed to modify order:', error);
      alert('Помилка при модифікації замовлення');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  // Order not found
  if (!order) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Text fw={500} mb="xs">
            Замовлення не знайдено
          </Text>
          <Text size="sm" mb="md">
            Замовлення з ID {id} не існує або було видалено.
          </Text>
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Повернутися назад
          </Button>
        </Alert>
      </Container>
    );
  }

  // Cannot edit order
  if (!canEdit) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
          <Text fw={500} mb="xs">
            Неможливо редагувати замовлення
          </Text>
          <Text size="sm" mb="md">
            Це замовлення неможливо редагувати через його поточний статус: {order.status}
          </Text>
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
            Повернутися назад
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <LoadingOverlay visible={modifyOrder.isPending} />

      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Group gap="sm" align="center">
            <ActionIcon variant="light" onClick={() => router.back()}>
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2}>Редагування замовлення #{order.orderNumber}</Title>
          </Group>
          <Group mt="xs" gap="md">
            <div>
              <Text c="dimmed" size="sm">
                Статус замовлення:
              </Text>
              <Badge color="blue" variant="light">
                {order.status}
              </Badge>
            </div>
            <div>
              <Text c="dimmed" size="sm">
                Статус оплати:
              </Text>
              <Badge
                color={
                  paymentStatus === 'PAID'
                    ? 'green'
                    : paymentStatus === 'FAILED'
                      ? 'red'
                      : paymentStatus === 'REFUNDED'
                        ? 'orange'
                        : 'yellow'
                }
                variant="light">
                {paymentStatus}
              </Badge>
            </div>
          </Group>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Скасувати
        </Button>
      </Group>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap="xl">
          {/* Customer Information */}
          <CustomerInfoSection
            form={form}
            order={order}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            onPaymentStatusUpdated={(newStatus) => {
              // Update local order state if needed
            }}
          />

          {/* Shipping Address */}
          <ShippingAddressSection form={form} />

          {/* Order Items */}
          <OrderItemsManager
            items={items}
            newItems={newItems}
            availableProducts={availableProducts}
            order={order}
            totals={totals}
            onUpdateQuantity={(itemId, quantity) => updateItemQuantity(itemId, quantity, setItems)}
            onUpdatePrice={(itemId, price) => updateItemPrice(itemId, price, setItems)}
            onRemoveItem={(itemId) => removeItem(itemId, setItems)}
            onAddProduct={handleAddProduct}
            setNewItems={setNewItems}
          />

          {/* Notes */}
          <OrderNotesSection form={form} />

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => router.back()}>
              Скасувати
            </Button>
            <Button type="submit" loading={modifyOrder.isPending}>
              Зберегти зміни
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}

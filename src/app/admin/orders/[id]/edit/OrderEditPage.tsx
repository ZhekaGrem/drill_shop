// src/app/admin/orders/[id]/edit/OrderEditPage.tsx - WITH MANTINE UI
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Card,
  Group,
  Button,
  Title,
  Text,
  TextInput,
  Textarea,
  Grid,
  Stack,
  Alert,
  LoadingOverlay,
  Badge,
  ActionIcon,
  NumberInput,
  Divider,
  Paper,
  Select,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconAlertCircle, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { Order, OrderItem, Product, OrderStatus, PaymentStatus } from '@/shared/types/generated.types';
import { useModifyOrder } from '@/features/admin/hooks/useModifyOrder';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/auth';
import { formatPrice } from '@/shared/utils/format';

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

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
  product?: Product;
  variant?: { id: string; name?: string; sku: string };
}

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemEdit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [newItems, setNewItems] = useState<
    Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
      product: Product;
    }>
  >([]);

  const [debugOpened, { toggle: toggleDebug }] = useDisclosure(false);
  const modifyOrder = useModifyOrder();

  const form = useForm<EditOrderForm>({
    resolver: zodResolver(editOrderSchema),
  });

  const city = form.watch('shippingAddress.city');

  // Load order data
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const productsResponse = await apiClient.get('/products?limit=100&status=ACTIVE');
        if (productsResponse.data.success) {
          setAvailableProducts(productsResponse.data.data);
        }
        // ✅ Простий запит - apiClient вже має auth
        const response = await apiClient.get(`/admin/orders/${id}`);

        if (response.data.success) {
          const orderData = response.data.data;

          setOrder(orderData);
          setItems(orderData.items || []);
          setPaymentStatus(orderData.paymentStatus || PaymentStatus.PENDING);

          // Extract customer info properly from API response
          const customerData = orderData.user || {};
          let shippingAddr = orderData.shippingAddress || {};

          // Handle case where shippingAddress might be a string (JSON)
          if (typeof shippingAddr === 'string') {
            try {
              shippingAddr = JSON.parse(shippingAddr);
            } catch (e) {
              console.warn('Failed to parse shipping address:', shippingAddr);
              shippingAddr = {};
            }
          }

          // Populate form with correct API structure mapping
          form.reset({
            guestEmail: orderData.guestEmail || customerData.email || '',
            guestPhone: orderData.guestPhone || customerData.phone || '',
            guestFirstName:
              orderData.guestFirstName || customerData.firstName || shippingAddr.firstName || '',
            guestLastName: orderData.guestLastName || customerData.lastName || shippingAddr.lastName || '',
            shippingAddress: {
              fullName:
                `${shippingAddr.firstName || customerData.firstName || ''} ${shippingAddr.lastName || customerData.lastName || ''}`.trim(),
              street: shippingAddr.address1 || '',
              city: shippingAddr.city || '',
              postalCode: shippingAddr.zipCode || '',
              country: shippingAddr.country || 'UA',
              phone: shippingAddr.phone || orderData.guestPhone || customerData.phone || '',
            },
            notes: orderData.notes || '',
            internalNotes: orderData.internalNotes || '',
            modificationReason: '',
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch order');
        }
      } catch (error: any) {
        console.error('❌ Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, form]);

  // Check if order can be edited
  const canEdit =
    order && [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(order.status);

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, newQuantity: quantity, isModified: true } : item))
    );
  };

  // Update item price
  const updateItemPrice = (itemId: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, newUnitPrice: price, isModified: true } : item))
    );
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isRemoved: true } : item)));
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      alert('Оберіть товар зі списку');
      return;
    }

    const product = availableProducts.find((p) => p.id === selectedProductId);
    if (!product) return;
    let selectedVariant = null;
    if (selectedVariantId) {
      selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
    }

    // Перевірка на дублікат
    const isDuplicate = newItems.some(
      (item) => item.productId === selectedProductId && item.variantId === selectedVariantId
    );

    if (isDuplicate) {
      alert('Цей товар вже додано до списку');
      return;
    }
    const newItem = {
      productId: product.id,
      variantId: selectedVariantId || undefined,
      quantity: 1,
      unitPrice: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
      product: product,
      variant: selectedVariant || undefined,
    };

    setNewItems((prev) => [...prev, newItem]);
    setSelectedProductId('');
    setSelectedVariantId('');
    setShowProductSearch(false);
  };

  // Calculate totals
  const calculateTotals = () => {
    const activeItems = items.filter((item) => !item.isRemoved);
    const subtotal = activeItems.reduce((sum, item) => {
      const quantity = item.newQuantity ?? item.quantity;
      const price = item.newUnitPrice ?? item.unitPrice;
      return sum + quantity * Number(price);
    }, 0);

    const newItemsTotal = newItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return {
      subtotal: subtotal + newItemsTotal,
      totalAmount: subtotal + newItemsTotal + Number(order?.shippingAmount || 0),
    };
  };

  // Update payment status separately
  const handlePaymentStatusUpdate = async () => {
    if (!order || paymentStatus === order.paymentStatus) return;

    setIsUpdatingPaymentStatus(true);
    try {
      await apiClient.patch(`/admin/orders/${order.id}/status`, {
        paymentStatus,
        comment: `Статус оплати змінено з ${order.paymentStatus} на ${paymentStatus}`,
        notifyCustomer: false,
      });

      // Update local order state
      setOrder({ ...order, paymentStatus });
      alert('Статус оплати успішно оновлено');
    } catch (error: any) {
      console.error('❌ Failed to update payment status:', error);
      alert('Помилка при оновленні статусу оплати');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };

  // Submit form
  const onSubmit = async (data: EditOrderForm) => {
    if (!order) return;

    try {
      // 1. Оновити решту даних замовлення
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
        <Stack gap="md">
          <Card withBorder>
            <div style={{ height: '200px' }} />
          </Card>
        </Stack>
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

  const totals = calculateTotals();

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
                  paymentStatus === PaymentStatus.PAID
                    ? 'green'
                    : paymentStatus === PaymentStatus.FAILED
                      ? 'red'
                      : paymentStatus === PaymentStatus.REFUNDED
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

      {/* Debug info in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <Card withBorder mb="xl">
          <Group justify="space-between" onClick={toggleDebug} style={{ cursor: 'pointer' }}>
            <Text fw={500}>Debug Info</Text>
            {debugOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Group>
          <Collapse in={debugOpened}>
            <Box mt="md">
              <Text size="xs" c="dimmed" component="pre" style={{ fontSize: '10px', overflow: 'auto' }}>
                {JSON.stringify({ 
                  orderStatus: order.status,
                  canEdit,
                  customerData: order.customer,
                  itemsCount: items.length,
                  formData: form.getValues()
                }, null, 2)}
              </Text>
            </Box>
          </Collapse>
        </Card>
      )} */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}>
        <Stack gap="xl">
          {/* Customer Information */}
          <Card shadow="sm" padding="lg" withBorder>
            <Group mb="lg">
              <IconEdit size={20} />
              <Title order={3}>Інформація про клієнта</Title>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Ім'я"
                  required
                  {...form.register('guestFirstName')}
                  error={form.formState.errors.guestFirstName?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Прізвище"
                  required
                  {...form.register('guestLastName')}
                  error={form.formState.errors.guestLastName?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Email"
                  type="email"
                  {...form.register('guestEmail')}
                  error={form.formState.errors.guestEmail?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput label="Телефон" {...form.register('shippingAddress.phone')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs">
                  <Select
                    label="Статус оплати"
                    description="Змініть статус оплати замовлення"
                    data={[
                      { value: PaymentStatus.PENDING, label: 'Очікує оплати' },
                      { value: PaymentStatus.PAID, label: 'Оплачено' },
                      { value: PaymentStatus.FAILED, label: 'Помилка оплати' },
                      { value: PaymentStatus.PARTIALLY_PAID, label: 'Частково оплачено' },
                      { value: PaymentStatus.REFUNDED, label: 'Повернуто' },
                    ]}
                    value={paymentStatus}
                    onChange={(value) => setPaymentStatus(value as PaymentStatus)}
                  />
                  <Button
                    size="xs"
                    variant="light"
                    loading={isUpdatingPaymentStatus}
                    disabled={paymentStatus === order?.paymentStatus}
                    onClick={handlePaymentStatusUpdate}>
                    Оновити статус оплати
                  </Button>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>

          {/* Shipping Address */}
          <Card shadow="sm" padding="lg" withBorder>
            <Title order={3} mb="lg">
              Адреса доставки
            </Title>

            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Повне ім'я"
                  required
                  {...form.register('shippingAddress.fullName')}
                  error={form.formState.errors.shippingAddress?.fullName?.message}
                />
              </Grid.Col>
              {city && city.trim() !== '' ? (
                <>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Місто"
                      required
                      {...form.register('shippingAddress.city')}
                      error={form.formState.errors.shippingAddress?.city?.message}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Адреса"
                      required
                      {...form.register('shippingAddress.street')}
                      error={form.formState.errors.shippingAddress?.street?.message}
                    />
                  </Grid.Col>
                </>
              ) : (
                <Grid.Col span={12}>
                  <TextInput
                    label="Адреса"
                    required
                    {...form.register('shippingAddress.street')}
                    error={form.formState.errors.shippingAddress?.street?.message}
                  />
                </Grid.Col>
              )}
            </Grid>
          </Card>

          {/* Order Items */}
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between" mb="lg">
              <Title order={3}>Товари замовлення</Title>
              <Card padding="sm" withBorder mb="md" style={{ backgroundColor: '#f8f9fa', minWidth: '300px' }}>
                <Stack gap="sm">
                  <Text size="sm" fw={500}>
                    Додати товар до замовлення
                  </Text>

                  <Select
                    label="Товар"
                    placeholder="Оберіть товар зі списку"
                    data={availableProducts.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.sku}) - ${formatPrice(Number(p.price))}${p.variants && p.variants.length > 0 ? ` • ${p.variants.length} варіантів` : ''}`,
                    }))}
                    value={selectedProductId}
                    onChange={(value) => {
                      setSelectedProductId(value || '');
                      setSelectedVariantId(''); // Скинути варіант при зміні товару
                    }}
                    searchable
                    comboboxProps={{ zIndex: 1001 }}
                  />
                  {/*Варіанти товару */}
                  {selectedProductId &&
                    (() => {
                      const product = availableProducts.find((p) => p.id === selectedProductId);
                      return product?.variants && product.variants.length > 0;
                    })() && (
                      <Select
                        label="Варіант товару (опціонально)"
                        placeholder="Оберіть варіант або залиште основний товар"
                        data={(() => {
                          const product = availableProducts.find((p) => p.id === selectedProductId);
                          if (!product?.variants) return [];
                          return [
                            { value: '', label: '--- Основний товар ---' },
                            ...product.variants.map((v) => ({
                              value: v.id,
                              label: `${v.name || v.sku} - ${formatPrice(Number(v.price))}${v.unitValue ? ` (${v.unitValue} ${product.unit || ''})` : ''}`,
                            })),
                          ];
                        })()}
                        value={selectedVariantId}
                        onChange={(value) => setSelectedVariantId(value || '')}
                        clearable
                        comboboxProps={{ zIndex: 1001 }}
                      />
                    )}
                  <Group justify="flex-end">
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddProduct}
                      disabled={!selectedProductId}>
                      Додати товар
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Group>

            <Stack gap="md">
              {items.map((item) => {
                const productInfo = item.productSnapshot;
                const productName = productInfo?.name || 'Невідомий товар';
                const productSku = productInfo?.sku || 'N/A';

                return (
                  <Paper
                    key={item.id}
                    withBorder
                    p="md"
                    style={{
                      opacity: item.isRemoved ? 0.5 : 1,
                      backgroundColor: item.isRemoved ? 'var(--mantine-color-red-0)' : undefined,
                    }}>
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Text fw={500}>{productName}</Text>

                        <Text size="sm" c="dimmed">
                          SKU: {productSku}
                        </Text>
                        {item.isRemoved && (
                          <Badge color="red" variant="light" size="sm" mt="xs">
                            Видалено
                          </Badge>
                        )}
                        {item.isModified && !item.isRemoved && (
                          <Badge color="blue" variant="light" size="sm" mt="xs">
                            Змінено
                          </Badge>
                        )}
                      </Box>

                      <Group gap="md" align="flex-end">
                        <NumberInput
                          label="Кількість"
                          value={item.newQuantity ?? item.quantity}
                          onChange={(value) => updateItemQuantity(item.id, Number(value) || 0)}
                          disabled={item.isRemoved}
                          min={1}
                          w={80}
                        />

                        <NumberInput
                          label="Ціна"
                          value={item.newUnitPrice ?? Number(item.unitPrice)}
                          onChange={(value) => updateItemPrice(item.id, Number(value) || 0)}
                          disabled={item.isRemoved}
                          min={0.01}
                          step={0.01}
                          w={100}
                        />

                        <Box>
                          <Text size="xs" c="dimmed">
                            Загалом
                          </Text>
                          <Text fw={500}>
                            {formatPrice(
                              (item.newQuantity ?? item.quantity) *
                                Number(item.newUnitPrice ?? item.unitPrice)
                            )}
                          </Text>
                        </Box>

                        {!item.isRemoved && (
                          <ActionIcon color="red" variant="light" onClick={() => removeItem(item.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Paper>
                );
              })}

              {/* New Items */}
              {newItems.map((item, index) => (
                <Paper
                  key={`new-${index}`}
                  withBorder
                  p="md"
                  style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text fw={500}>{item.product.name}</Text>
                      <Text size="sm" c="dimmed">
                        SKU: {item.product.sku}
                      </Text>
                      <Badge color="green" variant="light" size="sm" mt="xs">
                        НОВИЙ
                      </Badge>
                    </Box>

                    <Group gap="md" align="flex-end">
                      <NumberInput
                        label="Кількість"
                        value={item.quantity}
                        onChange={(value) => {
                          const newQuantity = Number(value) || 0;
                          setNewItems((prev) =>
                            prev.map((ni, i) => (i === index ? { ...ni, quantity: newQuantity } : ni))
                          );
                        }}
                        min={1}
                        w={80}
                      />

                      <NumberInput
                        label="Ціна"
                        value={item.unitPrice}
                        onChange={(value) => {
                          const newPrice = Number(value) || 0;
                          setNewItems((prev) =>
                            prev.map((ni, i) => (i === index ? { ...ni, unitPrice: newPrice } : ni))
                          );
                        }}
                        min={0.01}
                        step={0.01}
                        w={100}
                      />

                      <Box>
                        <Text size="xs" c="dimmed">
                          Загалом
                        </Text>
                        <Text fw={500}>{formatPrice(item.quantity * item.unitPrice)}</Text>
                      </Box>

                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => setNewItems((prev) => prev.filter((_, i) => i !== index))}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>

            {/* Order Summary */}
            <Divider my="lg" />
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="lg" fw={500}>
                    Підсумок:
                  </Text>
                  <Text size="lg" fw={500}>
                    {formatPrice(totals.subtotal)}
                  </Text>
                </Group>
                {/* <Group justify="space-between">
                  <Text>Доставка:</Text>
                  <Text>{formatPrice(Number(order.shippingAmount || 0))}</Text>
                </Group> */}
                <Divider />
                <Group justify="space-between">
                  <Text size="xl" fw={700}>
                    Всього:
                  </Text>
                  <Text size="xl" fw={700} c="blue">
                    {formatPrice(totals.totalAmount)}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Card>

          {/* Notes */}
          <Card shadow="sm" padding="lg" withBorder>
            <Title order={3} mb="lg">
              Примітки
            </Title>

            <Stack gap="md">
              <Textarea label="Примітки клієнта" rows={3} {...form.register('notes')} />

              <Textarea label="Внутрішні примітки" rows={3} {...form.register('internalNotes')} />
            </Stack>
          </Card>

          {/* Actions */}
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => router.back()}>
              Скасувати
            </Button>
            <Button
              type="submit"
              loading={modifyOrder.isPending}
              onClick={(e) => {
                if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
                  console.error('❌ Form has errors:', form.formState.errors);
                }
              }}>
              Зберегти зміни
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}

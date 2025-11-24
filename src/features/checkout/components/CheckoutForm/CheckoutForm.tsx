'use client';

import {
  Grid,
  Paper,
  Title,
  Stack,
  Group,
  TextInput,
  Textarea,
  Radio,
  Text,
  Divider,
  Alert,
  Center,
  Badge,
  Checkbox,
  Image,
} from '@mantine/core';
import { Controller } from 'react-hook-form';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/shared/utils/format';
import { useCheckout } from '../../hooks/useCheckout';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth';
import { CitySelect, City } from '../DeliveryMethod/CitySelect';
import { WarehouseSelect, Warehouse } from '../DeliveryMethod/WarehouseSelect';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import { PromoCodeInput } from '../PromoCodeInput/PromoCodeInput';

const paymentMethods = [
  {
    value: 'cash_on_delivery',
    label: 'Готівка при отриманні',
    description: 'Оплата готівкою або карткою у відділенні Нової Пошти.',
  },
  {
    value: 'liqpay',
    label: 'LiqPay',
    description: 'Оплата карткою Visa/MasterCard через систему LiqPay.',
    logo: '/logo/payment/liqpay.svg',
  },
  {
    value: 'monobank',
    label: 'Онлайн-оплата картою',
    description: 'Оплата через сервіс plata by mono.',
    logo: '/logo/payment/monobank.svg',
  },
];

const deliveryMethods = [
  { value: 'nova_poshta', label: 'Нова Пошта', description: 'Доставка до відділення Нової Пошти' },
  { value: 'other', label: 'Інший спосіб', description: 'Укрпошта, Містекспрес або інше' },
];

const CheckoutFormComponent = () => {
  const { items, calculations, isLoading: isCartLoading } = useCart();
  const { form, onSubmit, isLoading: isSubmitting, error: submitError } = useCheckout();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const { isAuthenticated, userProfile } = useAuthStore();

  // Local state for delivery
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [customDeliveryText, setCustomDeliveryText] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [doNotCall, setDoNotCall] = useState(false);

  // Local state for promo code
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    id: string;
    name: string;
  } | null>(null);

  const deliveryMethod = watch('deliveryMethod');

  // Формуємо фінальний notes для відправки
  const finalNotes = useMemo(() => {
    const parts = [];

    // Додаємо статус дзвінка
    parts.push(doNotCall ? 'не дзвонити для уточнення' : 'дзвонити для уточнення');

    // Додаємо побажання клієнта
    if (orderNotes.trim()) {
      parts.push(orderNotes.trim());
    }

    return parts.join('\n');
  }, [doNotCall, orderNotes]);

  // Sync finalNotes to form
  useEffect(() => {
    setValue('notes', finalNotes);
  }, [finalNotes, setValue]);

  // Reset city and warehouse when delivery method changes
  useEffect(() => {
    if (deliveryMethod !== 'nova_poshta') {
      setSelectedCity(null);
      setSelectedWarehouse(null);
      setValue('deliveryData.cityRef', '');
      setValue('deliveryData.cityName', '');
      setValue('deliveryData.warehouseRef', '');
      setValue('deliveryData.warehouseName', '');
      setValue('shippingAddress.address1', '');
      setValue('shippingAddress.city', '');
      setCustomDeliveryText('');
    }
  }, [deliveryMethod, setValue]);

  // Handle city change - clear warehouse when city changes
  const handleCityChange = useCallback(
    (city: City | null) => {
      setSelectedCity(city);
      setSelectedWarehouse(null);

      if (city) {
        setValue('shippingAddress.city', city.name);
        setValue('deliveryData.cityRef', city.ref);
        setValue('deliveryData.cityName', city.name);
      } else {
        setValue('shippingAddress.city', '');
        setValue('shippingAddress.address1', '');
        setValue('deliveryData.cityRef', '');
        setValue('deliveryData.cityName', '');
      }
      setValue('deliveryData.warehouseRef', '');
      setValue('deliveryData.warehouseName', '');
      setValue('shippingAddress.address1', '');
    },
    [setValue]
  );

  // Handle warehouse change
  const handleWarehouseChange = useCallback(
    (warehouseRef: string, warehouse: Warehouse | null) => {
      setSelectedWarehouse(warehouse);

      if (warehouse) {
        setValue('deliveryData.warehouseRef', warehouse.ref);
        setValue('deliveryData.warehouseName', warehouse.name);
        setValue('shippingAddress.address1', warehouse.name);
      } else {
        setValue('deliveryData.warehouseRef', '');
        setValue('deliveryData.warehouseName', '');
        setValue('shippingAddress.address1', '');
      }
    },
    [setValue]
  );

  // Handle custom delivery text change
  const handleCustomDeliveryChange = useCallback(
    (text: string) => {
      setCustomDeliveryText(text);
      const cleanText = text.replace(/\n/g, ', ');
      setValue('shippingAddress.address1', cleanText);
      setValue('shippingAddress.city', ''); // Для "Інший спосіб" city має бути пустим
    },
    [setValue]
  );

  // Quick insert buttons
  const insertQuickText = useCallback(
    (text: string) => {
      const newText = customDeliveryText ? `${customDeliveryText}, ${text}` : text;
      handleCustomDeliveryChange(newText);
    },
    [customDeliveryText, handleCustomDeliveryChange]
  );

  if (items.length === 0 && !isCartLoading) {
    return (
      <Paper p="xl" withBorder ta="center">
        <Title order={2}>Ваш кошик порожній</Title>
        <Text c="dimmed" mt="md">
          Додайте товари до кошика, щоб оформити замовлення.
        </Text>
        <Center mt="xl">
          <Link href="/catalog">
            <Button mt="xl">Перейти до каталогу</Button>
          </Link>
        </Center>
      </Paper>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="xl" withBorder>
            <Stack gap="lg">
              {submitError && (
                <Alert color="red" icon={<IconAlertCircle />}>
                  Помилка створення замовлення. Перевірте дані та спробуйте ще раз.
                </Alert>
              )}

              <Title order={3}>Контактні дані</Title>

              <Group grow>
                <TextInput
                  label="Ім'я"
                  placeholder="Іван"
                  {...register('shippingAddress.firstName')}
                  error={errors.shippingAddress?.firstName?.message}
                  required
                />
                <TextInput
                  label="Прізвище"
                  placeholder="Петренко"
                  {...register('shippingAddress.lastName')}
                  error={errors.shippingAddress?.lastName?.message}
                  required
                />
              </Group>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                {...register('guestEmail')}
                error={errors.guestEmail?.message}
                required
              />
              <TextInput
                label="Телефон"
                placeholder="+380501234567"
                {...register('shippingAddress.phone')}
                error={errors.shippingAddress?.phone?.message}
                required
              />

              {/* Delivery method selection */}
              <Title order={3}>Спосіб доставки</Title>
              <Controller
                control={control}
                name="deliveryMethod"
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    label="Виберіть спосіб доставки"
                    required
                    error={errors.deliveryMethod?.message}>
                    <Stack mt="xs">
                      {deliveryMethods.map((method) => (
                        <Paper key={method.value} p="md" withBorder>
                          <Radio value={method.value} label={method.label} />
                          <Text size="sm" c="dimmed" mt={4}>
                            {method.description}
                          </Text>
                        </Paper>
                      ))}
                    </Stack>
                  </Radio.Group>
                )}
              />

              {/* Nova Poshta specific fields */}
              {deliveryMethod === 'nova_poshta' && (
                <Stack gap="md">
                  <CitySelect
                    value={selectedCity}
                    onChange={handleCityChange}
                    error={errors.deliveryData?.cityRef?.message || errors.shippingAddress?.city?.message}
                    onBlur={() => {
                      form.trigger('deliveryData.cityRef');
                      form.trigger('shippingAddress.city');
                    }}
                  />

                  {selectedCity && (
                    <WarehouseSelect
                      cityRef={selectedCity.ref}
                      value={selectedWarehouse?.ref || ''}
                      onChange={handleWarehouseChange}
                      error={errors.deliveryData?.warehouseRef?.message}
                      required
                      onBlur={() => form.trigger('deliveryData.warehouseRef')}
                    />
                  )}
                </Stack>
              )}

              {/* Other delivery method */}
              {deliveryMethod === 'other' && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Адреса доставки
                  </Text>
                  <Group gap="xs" mb="xs">
                    <Badge
                      size="lg"
                      variant="light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => insertQuickText('Укрпошта')}>
                      Укрпошта
                    </Badge>
                    <Badge
                      size="lg"
                      variant="light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => insertQuickText('Містекспрес')}>
                      Містекспрес
                    </Badge>
                  </Group>

                  <Textarea
                    placeholder="Вкажіть спосіб доставки та адресу"
                    value={customDeliveryText}
                    onChange={(e) => handleCustomDeliveryChange(e.target.value)}
                    minRows={3}
                    required
                    error={!customDeliveryText ? 'Вкажіть адресу доставки' : undefined}
                  />
                </Stack>
              )}

              {/* Hidden delivery data fields */}
              <input type="hidden" {...register('deliveryData.cityRef')} />
              <input type="hidden" {...register('deliveryData.cityName')} />
              <input type="hidden" {...register('deliveryData.warehouseRef')} />
              <input type="hidden" {...register('deliveryData.warehouseName')} />

              <Title order={3}>Спосіб оплати</Title>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    label="Виберіть спосіб оплати"
                    required
                    error={errors.paymentMethod?.message}>
                    <Stack mt="xs">
                      {paymentMethods.map((method) => (
                        <Paper key={method.value} p="md" withBorder>
                          <Group justify="space-between" align="flex-start">
                            <Stack gap={4} style={{ flex: 1 }}>
                              <Radio value={method.value} label={method.label} />
                              <Text size="sm" c="dimmed" ml={22}>
                                {method.description}
                              </Text>
                            </Stack>
                            {method.logo && (
                              <Center>
                                <Image
                                  src={method.logo}
                                  alt={`${method.label} logo`}
                                  w={60}
                                  h={34}
                                  fit="contain"
                                />
                              </Center>
                            )}
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Radio.Group>
                )}
              />

              {/* Побажання + Не дзвонити */}
              <Title order={3}>Побажання до замовлення</Title>
              <Textarea
                placeholder="Ваші побажання щодо замовлення"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                minRows={2}
              />

              {/* Hidden notes field - synced with finalNotes */}
              <input type="hidden" {...register('notes')} value={finalNotes} />

              {/* Promo code section */}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Right column - order summary */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper p="xl" withBorder pos="sticky" top={20}>
            <Stack gap="md">
              <Title order={3}>Ваше замовлення</Title>
              <Text size="lg" fw={700}>
                Промокод
              </Text>
              <PromoCodeInput
                orderAmount={calculations.totalAmount}
                onApply={(discountData) => {
                  setAppliedDiscount({
                    code: discountData.code,
                    amount: discountData.discountAmount,
                    id: discountData.discountId,
                    name: discountData.discountName,
                  });
                  setValue('discountCode', discountData.code);
                }}
                onRemove={() => {
                  setAppliedDiscount(null);
                  setValue('discountCode', undefined);
                }}
                appliedCode={appliedDiscount?.code}
                disabled={isSubmitting}
              />
              <Stack gap="sm">
                {items.map((item) => {
                  const price = item.finalPrice;
                  return (
                    <Group key={item.id} justify="space-between">
                      <Stack gap={2}>
                        <Text size="sm">
                          x{item.quantity} {item.product.name}
                        </Text>
                        {(() => {
                          const badges = getVariantDisplayBadges(
                            item.variant?.options || item.product.options
                          );

                          if (badges.length === 0) return null;

                          return (
                            <Group gap={4}>
                              {badges.map((badge) => (
                                <Badge key={badge.key} size="xs" variant="light" color="blue">
                                  {badge.label}: {badge.value}
                                </Badge>
                              ))}
                            </Group>
                          );
                        })()}
                      </Stack>
                      <Text size="sm">{formatPrice(price * item.quantity)}</Text>
                    </Group>
                  );
                })}
              </Stack>
              <Divider />

              <Group justify="space-between">
                <Text>Доставка</Text>
                <Text>За тарифами перевізника</Text>
              </Group>

              {/* Discount section */}
              {appliedDiscount && (
                <>
                  <Divider />
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Підсумок
                      </Text>
                      <Text size="sm">{formatPrice(calculations.totalAmount)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Stack gap={0}>
                        <Text size="sm" fw={500} c="green">
                          Промокод: {appliedDiscount.code}
                        </Text>
                        {appliedDiscount.name && (
                          <Text size="xs" c="dimmed">
                            {appliedDiscount.name}
                          </Text>
                        )}
                      </Stack>
                      <Text size="sm" fw={500} c="green">
                        -{formatPrice(appliedDiscount.amount)}
                      </Text>
                    </Group>
                  </Stack>
                </>
              )}

              <Divider />
              <Group justify="space-between">
                <Text size="lg" fw={700}>
                  До сплати
                </Text>
                <Text size="xl" fw={700}>
                  {formatPrice(
                    appliedDiscount
                      ? Math.max(0, calculations.totalAmount - appliedDiscount.amount)
                      : calculations.totalAmount
                  )}
                </Text>
              </Group>
              <Paper p="sm" withBorder>
                <Group gap="xs" justify="space-between">
                  <Text
                    component="label"
                    htmlFor="doNotCall"
                    size="sm"
                    style={{ cursor: 'pointer', userSelect: 'none' }}>
                    Не дзвонити для уточнення
                  </Text>
                  <Checkbox
                    type="checkbox"
                    id="doNotCall"
                    checked={doNotCall}
                    onChange={(e) => setDoNotCall(e.target.checked)}
                    style={{
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--accent-yellow))',
                    }}
                  />
                </Group>
              </Paper>
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={isCartLoading || items.length === 0}>
                {isSubmitting ? 'Створення замовлення...' : 'Підтвердити замовлення'}
              </Button>
              <Alert variant="default" color="blue" title="Увага" icon={<IconAlertCircle />}>
                Натискаючи "Підтвердити замовлення", ви погоджуєтесь з умовами
                <Text component={Link} href="/public-offer" size="sm" c="blue">
                  {' '}
                  публічної оферти
                </Text>{' '}
                та
                <Text component={Link} href="/privacy-policy" size="sm" c="blue">
                  {' '}
                  політики конфіденційності
                </Text>
                .
              </Alert>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </form>
  );
};

export const CheckoutForm = memo(CheckoutFormComponent);

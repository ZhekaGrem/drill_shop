'use client';

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
import { PromoCodeInput } from '../PromoCodeInput/PromoCodeInput';
import styles from './CheckoutForm.module.scss';
import Image from 'next/image';
import { Input, TextareaField, PhoneInput } from '@/shared/components/Input';
import { Radio, Checkbox, Alert, Stack } from '@mantine/core';
import { CheckoutCard } from '../CheckoutCard';

const paymentMethods = [
  {
    value: 'cash_on_delivery',
    label: 'Готівка при отриманні',
    description: 'Оплата готівкою або карткою у відділенні Нової Пошти.',
  },
  // {
  //   value: 'liqpay',
  //   label: 'LiqPay',
  //   description: 'Оплата карткою Visa/MasterCard через систему LiqPay.',
  //   logo: '/logo/payment/liqpay.svg',
  // },
  // {
  //   value: 'monobank',
  //   label: 'Онлайн-оплата картою',
  //   description: 'Оплата через сервіс plata by mono.',
  //   logo: '/logo/payment/monobank.svg',
  // },
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
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = form;
  const { isAuthenticated, userProfile } = useAuthStore();

  // Auto-scroll to first error when form is submitted with errors
  useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      // Прокрутити до верху форми щоб показати Alert з помилками
      const formElement = document.querySelector(`.${styles.checkoutForm}`);
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [errors, isSubmitted]);

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
      <div className={styles.emptyCart}>
        <h2 className={styles.emptyCart__title}>Ваш кошик порожній</h2>
        <p className={styles.emptyCart__text}>Додайте товари до кошика, щоб оформити замовлення.</p>
        <Link href="/catalog">
          <Button size="lg" variant="primary">
            Перейти до каталогу
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.checkoutForm}>
      <div className={styles.formGrid}>
        {/* Left column - form */}
        <div className={styles.formColumn}>
          <div className={styles.formSection}>
            {/* Validation errors */}
            {isSubmitted && Object.keys(errors).length > 0 && (
              <Alert color="red" icon={<IconAlertCircle size={20} />} radius={0} mb="md">
                <strong>Будь ласка, виправте помилки:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  {errors.shippingAddress?.firstName && <li>{errors.shippingAddress.firstName.message}</li>}
                  {errors.shippingAddress?.lastName && <li>{errors.shippingAddress.lastName.message}</li>}
                  {errors.guestEmail && <li>Email: {errors.guestEmail.message}</li>}
                  {errors.shippingAddress?.phone && <li>Телефон: {errors.shippingAddress.phone.message}</li>}
                  {errors.deliveryMethod && <li>{errors.deliveryMethod.message}</li>}
                  {errors.shippingAddress?.city && <li>Увага: {errors.shippingAddress.city.message}</li>}
                  {errors.deliveryData?.cityRef && <li>Увага: {errors.deliveryData.cityRef.message}</li>}
                  {errors.deliveryData?.warehouseRef && (
                    <li>Відділення: {errors.deliveryData.warehouseRef.message}</li>
                  )}
                  {errors.shippingAddress?.address1 && <li>{errors.shippingAddress.address1.message}</li>}
                  {errors.paymentMethod && <li>{errors.paymentMethod.message}</li>}
                </ul>
              </Alert>
            )}

            {/* Submit error from backend */}
            {submitError && (
              <Alert color="red" icon={<IconAlertCircle size={20} />} radius={0} mb="md">
                Помилка створення замовлення. Перевірте дані та спробуйте ще раз.
              </Alert>
            )}

            <h3 className={styles.sectionTitle}>КОНТАКТНІ ДАНІ</h3>

            <div className={styles.formRow}>
              <Input
                label="Ім'я"
                placeholder="Іван"
                required
                error={errors.shippingAddress?.firstName?.message}
                {...register('shippingAddress.firstName')}
              />

              <Input
                label="Прізвище"
                placeholder="Петренко"
                required
                error={errors.shippingAddress?.lastName?.message}
                {...register('shippingAddress.lastName')}
              />
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
              error={errors.guestEmail?.message}
              {...register('guestEmail')}
            />

            <Controller
              control={control}
              name="shippingAddress.phone"
              render={({ field }) => (
                <PhoneInput
                  label="Телефон"
                  placeholder="+380 (XX) XXX XX XX"
                  required
                  error={errors.shippingAddress?.phone?.message}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Delivery method selection */}
            <h3 className={styles.sectionTitle}>ДОСТАВКА</h3>
            <Controller
              control={control}
              name="deliveryMethod"
              render={({ field }) => (
                <div className={styles.radioGroup}>
                  <p className={styles.radioGroupLabel}>
                    Виберіть спосіб доставки <span className={styles.required}>*</span>
                  </p>
                  {errors.deliveryMethod && (
                    <span className={styles.errorMessage}>{errors.deliveryMethod.message}</span>
                  )}
                  <div className={styles.radioOptions}>
                    {deliveryMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`${styles.radioOption} ${field.value === method.value ? styles.radioOptionActive : ''}`}>
                        <input
                          type="radio"
                          value={method.value}
                          checked={field.value === method.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={styles.radioInput}
                        />

                        {/* Круглий radio зліва */}
                        <div className={styles.radioCircle}>
                          {field.value === method.value && <div className={styles.radioCircleInner}></div>}
                        </div>

                        {/* Вертикальна перегородка */}
                        <div className={styles.dividerVertical}></div>

                        <div className={styles.radioContent}>
                          <span className={styles.radioLabel}>{method.label}</span>
                          <span className={styles.radioDescription}>{method.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Nova Poshta specific fields */}
            {deliveryMethod === 'nova_poshta' && (
              <div className={styles.deliveryFields}>
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
              </div>
            )}

            {/* Other delivery method */}
            {deliveryMethod === 'other' && (
              <div className={styles.customDelivery}>
                <div className={styles.quickButtons}>
                  <Button variant="ghost" size="sm" type="button" onClick={() => insertQuickText('Укрпошта')}>
                    Укрпошта
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => insertQuickText('Містекспрес')}>
                    Містекспрес
                  </Button>
                </div>
                <TextareaField
                  label="Адреса доставки"
                  placeholder="Вкажіть спосіб доставки та адресу"
                  required
                  value={customDeliveryText}
                  onChange={(e) => handleCustomDeliveryChange(e.target.value)}
                  minRows={3}
                  error={!customDeliveryText ? 'Вкажіть адресу доставки' : undefined}
                />
              </div>
            )}

            {/* Hidden delivery data fields */}
            <input type="hidden" {...register('deliveryData.cityRef')} />
            <input type="hidden" {...register('deliveryData.cityName')} />
            <input type="hidden" {...register('deliveryData.warehouseRef')} />
            <input type="hidden" {...register('deliveryData.warehouseName')} />

            <h3 className={styles.sectionTitle}>ОПЛАТА</h3>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <div className={styles.radioGroup}>
                  <p className={styles.radioGroupLabel}>
                    Усі транзакції безпечні та зашифровані <span className={styles.required}>*</span>
                  </p>
                  {errors.paymentMethod && (
                    <span className={styles.errorMessage}>{errors.paymentMethod.message}</span>
                  )}
                  <div className={styles.radioOptions}>
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`${styles.radioOption} ${field.value === method.value ? styles.radioOptionActive : ''}`}>
                        <input
                          type="radio"
                          value={method.value}
                          checked={field.value === method.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={styles.radioInput}
                        />

                        {/* Круглий radio зліва */}
                        <div className={styles.radioCircle}>
                          {field.value === method.value && <div className={styles.radioCircleInner}></div>}
                        </div>

                        {/* Вертикальна перегородка */}
                        <div className={styles.dividerVertical}></div>

                        <div className={styles.radioContent}>
                          <span className={styles.radioLabel}>{method.label}</span>
                          <span className={styles.radioDescription}>{method.description}</span>
                        </div>
                        {/* {method.logo && (
                          <div className={styles.paymentLogo}>
                            <Image src={method.logo} alt={`${method.label} logo`} width={60} height={34} />
                          </div>
                        )} */}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Побажання до замовлення */}
            <h3 className={styles.sectionTitle}>Додаткова інформація</h3>
            <TextareaField
              placeholder="Ваші побажання щодо замовлення"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              minRows={2}
            />

            <Checkbox
              label="Не дзвонити для уточнення"
              checked={doNotCall}
              onChange={(e) => setDoNotCall(e.currentTarget.checked)}
              className={styles.btnConfirm}
              radius={0}
              styles={{
                root: { padding: 'var(--spacing-sm) var(--spacing-md)' },
                label: { fontFamily: 'var(--font-condensed)', fontSize: 'var(--text-sm)' },
              }}
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              className={styles.btnConfirm}
              loading={isSubmitting}
              disabled={isCartLoading || items.length === 0}>
              {isSubmitting ? 'Створення замовлення...' : 'Підтвердити замовлення'}
            </Button>

            <div className={styles.agreementNotice}>
              <IconAlertCircle size={20} />
              <p className={styles.agreementText}>
                Натискаючи "Підтвердити замовлення", ви погоджуєтесь з умовами{' '}
                <Link href="/public-offer" className={styles.agreementLink}>
                  публічної оферти
                </Link>{' '}
                та{' '}
                <Link href="/privacy-policy" className={styles.agreementLink}>
                  політики конфіденційності
                </Link>
                .
              </p>
            </div>
            {/* Hidden notes field - synced with finalNotes */}
            <input type="hidden" {...register('notes')} value={finalNotes} />
          </div>
        </div>

        {/* Right column - order summary */}
        <div className={styles.summaryColumn}>
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>ВАШЕ ЗАМОВЛЕННЯ</h3>

            <Stack gap={0}>
              {items.map((item) => (
                <CheckoutCard key={item.id} item={item} />
              ))}
            </Stack>
            <div className={styles.promoSection}>
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
            </div>

            {/* Discount section */}
            {appliedDiscount && (
              <>
                <div className={styles.divider} />
                <div className={styles.discountSection}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Підсумок</span>
                    <span className={styles.summaryValue}>{formatPrice(calculations.totalAmount)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <div className={styles.discountInfo}>
                      <span className={styles.discountCode}>Промокод: {appliedDiscount.code}</span>
                      {appliedDiscount.name && (
                        <span className={styles.discountName}>{appliedDiscount.name}</span>
                      )}
                    </div>
                    <span className={styles.discountAmount}>-{formatPrice(appliedDiscount.amount)}</span>
                  </div>
                </div>
              </>
            )}
            <div className={styles.divider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValue}>За тарифами перевізника</span>
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Загалом</span>
              <span className={styles.totalAmount}>
                {formatPrice(
                  appliedDiscount
                    ? Math.max(0, calculations.totalAmount - appliedDiscount.amount)
                    : calculations.totalAmount
                )}
              </span>
            </div>

            <Checkbox
              label="Не дзвонити для уточнення"
              checked={doNotCall}
              onChange={(e) => setDoNotCall(e.currentTarget.checked)}
              className={styles.btnConfirmPhone}
              radius={0}
              styles={{
                root: { padding: 'var(--spacing-sm) var(--spacing-md)' },
                label: { fontFamily: 'var(--font-condensed)', fontSize: 'var(--text-sm)' },
              }}
            />
            <Button
              type="submit"
              size="sm"
              variant="primary"
              fullWidth
              className={styles.btnConfirmPhone}
              loading={isSubmitting}
              disabled={isCartLoading || items.length === 0}>
              {isSubmitting ? 'Створення замовлення...' : 'Підтвердити замовлення'}
            </Button>

            <div className={styles.agreementNoticePhone}>
              <IconAlertCircle size={20} />
              <p className={styles.agreementText}>
                Натискаючи "Підтвердити замовлення", ви погоджуєтесь з умовами{' '}
                <Link href="/public-offer" className={styles.agreementLink}>
                  публічної оферти
                </Link>{' '}
                та{' '}
                <Link href="/privacy-policy" className={styles.agreementLink}>
                  політики конфіденційності
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export const CheckoutForm = memo(CheckoutFormComponent);

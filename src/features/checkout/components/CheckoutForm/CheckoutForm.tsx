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
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import { PromoCodeInput } from '../PromoCodeInput/PromoCodeInput';
import styles from './CheckoutForm.module.scss';
import Image from 'next/image';

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
            {submitError && (
              <div className={styles.alert}>
                <IconAlertCircle size={20} />
                <span>Помилка створення замовлення. Перевірте дані та спробуйте ще раз.</span>
              </div>
            )}

            <h3 className={styles.sectionTitle}>КОНТАКТНІ ДАНІ</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Ім'я <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.shippingAddress?.firstName ? styles.inputError : ''}`}
                  placeholder="Іван"
                  {...register('shippingAddress.firstName')}
                />
                {errors.shippingAddress?.firstName && (
                  <span className={styles.errorMessage}>{errors.shippingAddress.firstName.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Прізвище <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.shippingAddress?.lastName ? styles.inputError : ''}`}
                  placeholder="Петренко"
                  {...register('shippingAddress.lastName')}
                />
                {errors.shippingAddress?.lastName && (
                  <span className={styles.errorMessage}>{errors.shippingAddress.lastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={`${styles.input} ${errors.guestEmail ? styles.inputError : ''}`}
                placeholder="your@email.com"
                {...register('guestEmail')}
              />
              {errors.guestEmail && <span className={styles.errorMessage}>{errors.guestEmail.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Телефон <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={`${styles.input} ${errors.shippingAddress?.phone ? styles.inputError : ''}`}
                placeholder="+380501234567"
                {...register('shippingAddress.phone')}
              />
              {errors.shippingAddress?.phone && (
                <span className={styles.errorMessage}>{errors.shippingAddress.phone.message}</span>
              )}
            </div>

            {/* Delivery method selection */}
            <h3 className={styles.sectionTitle}>СПОСІБ ДОСТАВКИ</h3>
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
                <label className={styles.label}>
                  Адреса доставки <span className={styles.required}>*</span>
                </label>
                <div className={styles.quickButtons}>
                  <button
                    type="button"
                    className={styles.quickButton}
                    onClick={() => insertQuickText('Укрпошта')}>
                    Укрпошта
                  </button>
                  <button
                    type="button"
                    className={styles.quickButton}
                    onClick={() => insertQuickText('Містекспрес')}>
                    Містекспрес
                  </button>
                </div>
                <textarea
                  className={`${styles.textarea} ${!customDeliveryText ? styles.inputError : ''}`}
                  placeholder="Вкажіть спосіб доставки та адресу"
                  value={customDeliveryText}
                  onChange={(e) => handleCustomDeliveryChange(e.target.value)}
                  rows={3}
                />
                {!customDeliveryText && <span className={styles.errorMessage}>Вкажіть адресу доставки</span>}
              </div>
            )}

            {/* Hidden delivery data fields */}
            <input type="hidden" {...register('deliveryData.cityRef')} />
            <input type="hidden" {...register('deliveryData.cityName')} />
            <input type="hidden" {...register('deliveryData.warehouseRef')} />
            <input type="hidden" {...register('deliveryData.warehouseName')} />

            <h3 className={styles.sectionTitle}>СПОСІБ ОПЛАТИ</h3>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <div className={styles.radioGroup}>
                  <p className={styles.radioGroupLabel}>
                    Виберіть спосіб оплати <span className={styles.required}>*</span>
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
                        <div className={styles.radioContent}>
                          <span className={styles.radioLabel}>{method.label}</span>
                          <span className={styles.radioDescription}>{method.description}</span>
                        </div>
                        {method.logo && (
                          <div className={styles.paymentLogo}>
                            <Image src={method.logo} alt={`${method.label} logo`} width={60} height={34} />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Побажання до замовлення */}
            <h3 className={styles.sectionTitle}>ПОБАЖАННЯ ДО ЗАМОВЛЕННЯ</h3>
            <div className={styles.formGroup}>
              <textarea
                className={styles.textarea}
                placeholder="Ваші побажання щодо замовлення"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Hidden notes field - synced with finalNotes */}
            <input type="hidden" {...register('notes')} value={finalNotes} />
          </div>
        </div>

        {/* Right column - order summary */}
        <div className={styles.summaryColumn}>
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>ВАШЕ ЗАМОВЛЕННЯ</h3>

            <div className={styles.promoSection}>
              <h4 className={styles.promoTitle}>Промокод</h4>
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

            <div className={styles.orderItems}>
              {items.map((item) => {
                const price = item.finalPrice;
                return (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemQuantity}>x{item.quantity}</span>
                      <span className={styles.itemName}>{item.product.name}</span>
                      {(() => {
                        const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);
                        if (badges.length === 0) return null;
                        return (
                          <div className={styles.itemBadges}>
                            {badges.map((badge) => (
                              <span key={badge.key} className={styles.itemBadge}>
                                {badge.label}: {badge.value}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <span className={styles.itemPrice}>{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.divider} />

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValue}>За тарифами перевізника</span>
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

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>ДО СПЛАТИ</span>
              <span className={styles.totalAmount}>
                {formatPrice(
                  appliedDiscount
                    ? Math.max(0, calculations.totalAmount - appliedDiscount.amount)
                    : calculations.totalAmount
                )}
              </span>
            </div>

            <div className={styles.doNotCallWrapper}>
              <label className={styles.checkboxLabel} htmlFor="doNotCall">
                <input
                  type="checkbox"
                  id="doNotCall"
                  checked={doNotCall}
                  onChange={(e) => setDoNotCall(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Не дзвонити для уточнення</span>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
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
          </div>
        </div>
      </div>
    </form>
  );
};

export const CheckoutForm = memo(CheckoutFormComponent);

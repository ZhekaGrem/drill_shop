'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { Alert, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCheckout } from '../../hooks/useCheckout';
import { useDeliveryFields } from '../../hooks/useDeliveryFields';
import { Button } from '@/shared/components/Button/Button';
import { apiClient } from '@/shared/api/client';

// Sections
import { ContactInfoSection } from './sections/ContactInfoSection';
import { DeliverySection } from './sections/DeliverySection';
import { PaymentSection } from './sections/PaymentSection';
import { OrderNotesSection } from './sections/OrderNotesSection';
import { OrderSummary } from './OrderSummary/OrderSummary';

import styles from './CheckoutForm.module.scss';

interface CheckoutFormProps {
  email?: boolean;
}

const CheckoutFormComponent = ({ email = true }: CheckoutFormProps) => {
  const { items, calculations, isLoading: isCartLoading } = useCart();
  const { form, onSubmit, isLoading: isSubmitting, error: submitError } = useCheckout();
  const {
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
    setValue,
  } = form;

  const deliveryMethod = watch('deliveryMethod');

  // Delivery fields logic
  const {
    selectedCity,
    selectedWarehouse,
    customDeliveryText,
    handleCityChange,
    handleWarehouseChange,
    handleCustomDeliveryChange,
    insertQuickText,
  } = useDeliveryFields({ deliveryMethod, form });

  // Order notes state
  const [orderNotes, setOrderNotes] = useState('');
  const [doNotCall, setDoNotCall] = useState(false);

  // Promo code state
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    id: string;
    name: string;
    orderAmount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const isDiscountUpdating = Boolean(
    appliedDiscount && appliedDiscount.orderAmount !== calculations.totalAmount
  );

  // A percentage or minimum-order rule must be checked against the current
  // cart, not the amount that existed when the code was first applied.
  useEffect(() => {
    if (!appliedDiscount || appliedDiscount.orderAmount === calculations.totalAmount) return;
    let cancelled = false;
    const orderAmount = calculations.totalAmount;
    apiClient
      .post('/discounts/validate', { code: appliedDiscount.code, orderAmount })
      .then(({ data: response }) => {
        if (cancelled) return;
        const result = response.data ?? response;
        if (result.isValid && result.eligibleForDiscount) {
          setAppliedDiscount({ ...appliedDiscount, amount: result.potentialSavings, orderAmount });
          setDiscountError(null);
        } else {
          setAppliedDiscount(null);
          setValue('discountCode', undefined);
          setDiscountError(result.errorMessage || 'Промокод недоступний для оновленого кошика.');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAppliedDiscount(null);
        setValue('discountCode', undefined);
        setDiscountError('Не вдалося перевірити знижку. Застосуйте промокод повторно.');
      });
    return () => {
      cancelled = true;
    };
  }, [appliedDiscount, calculations.totalAmount, setValue]);

  // Формуємо фінальний notes для відправки
  const finalNotes = useMemo(() => {
    const parts = [];
    parts.push(doNotCall ? 'не дзвонити для уточнення' : 'дзвонити для уточнення');
    if (orderNotes.trim()) {
      parts.push(orderNotes.trim());
    }
    return parts.join('\n');
  }, [doNotCall, orderNotes]);

  // Sync finalNotes to form
  useEffect(() => {
    setValue('notes', finalNotes);
  }, [finalNotes, setValue]);

  // Auto-scroll to first error when form is submitted with errors
  useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      const formElement = document.querySelector(`.${styles.checkoutForm}`);
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [errors, isSubmitted]);

  // Empty cart state
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
    <form
      onSubmit={handleSubmit((data) => {
        if (!isDiscountUpdating) onSubmit(data);
      })}
      noValidate
      className={styles.checkoutForm}>
      <div className={styles.formGrid}>
        {/* Left column - form */}
        <div className={styles.formColumn}>
          <div className={styles.formSection}>
            {/* Validation errors */}
            {isSubmitted && Object.keys(errors).length > 0 && (
              <Alert color="red" icon={<IconAlertCircle size={20} />} radius={0} mb="md">
                <strong>Будь ласка, виправте помилки:</strong>
                <Box component="ul" mt={8} pl={20}>
                  {errors.shippingAddress?.firstName && <li>{errors.shippingAddress.firstName.message}</li>}
                  {errors.shippingAddress?.lastName && <li>{errors.shippingAddress.lastName.message}</li>}
                  {email && errors.guestEmail && <li>Email: {errors.guestEmail.message}</li>}
                  {errors.shippingAddress?.phone && <li>Телефон: {errors.shippingAddress.phone.message}</li>}
                  {errors.guestTelegram && <li>Telegram: {errors.guestTelegram.message}</li>}
                  {errors.deliveryMethod && <li>{errors.deliveryMethod.message}</li>}
                  {errors.shippingAddress?.city && <li>Увага: {errors.shippingAddress.city.message}</li>}
                  {errors.deliveryData?.cityRef && <li>Увага: {errors.deliveryData.cityRef.message}</li>}
                  {errors.deliveryData?.warehouseRef && (
                    <li>Відділення: {errors.deliveryData.warehouseRef.message}</li>
                  )}
                  {errors.shippingAddress?.address1 && <li>{errors.shippingAddress.address1.message}</li>}
                  {errors.paymentMethod && <li>{errors.paymentMethod.message}</li>}
                </Box>
              </Alert>
            )}

            {/* Submit error from backend */}
            {submitError && (
              <Alert color="red" icon={<IconAlertCircle size={20} />} radius={0} mb="md">
                Помилка створення замовлення. Перевірте дані та спробуйте ще раз.
              </Alert>
            )}

            {/* Contact Info */}
            <ContactInfoSection form={form} showEmail={email} />

            {/* Delivery */}
            <DeliverySection
              form={form}
              deliveryMethod={deliveryMethod}
              selectedCity={selectedCity}
              selectedWarehouse={selectedWarehouse}
              customDeliveryText={customDeliveryText}
              onCityChange={handleCityChange}
              onWarehouseChange={handleWarehouseChange}
              onCustomDeliveryChange={handleCustomDeliveryChange}
              onQuickInsert={insertQuickText}
            />

            {/* Payment */}
            <PaymentSection form={form} />

            {/* Order Notes */}
            <OrderNotesSection
              orderNotes={orderNotes}
              doNotCall={doNotCall}
              onOrderNotesChange={setOrderNotes}
              onDoNotCallChange={setDoNotCall}
            />

            {/* Submit Button (Desktop) */}
            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              className={styles.desktopOnly}
              loading={isSubmitting}
              disabled={isCartLoading || isDiscountUpdating || items.length === 0}>
              {isSubmitting ? 'Замовляємо…' : 'Замовити'}
            </Button>

            <div className={styles.agreementNotice}>
              <p className={styles.agreementText}>
                Натискаючи «Замовити», ви погоджуєтесь з умовами{' '}
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

            {/* Hidden notes field */}
            <input type="hidden" {...form.register('notes')} value={finalNotes} />
          </div>
        </div>

        {/* Right column - order summary */}
        <div className={styles.summaryColumn}>
          {isDiscountUpdating && <Alert>Перераховуємо знижку для оновленого кошика…</Alert>}
          {discountError && <Alert color="red">{discountError}</Alert>}
          <OrderSummary
            items={items}
            totalAmount={calculations.totalAmount}
            appliedDiscount={isDiscountUpdating ? null : appliedDiscount}
            doNotCall={doNotCall}
            isSubmitting={isSubmitting}
            isCartLoading={isCartLoading || isDiscountUpdating}
            onApplyDiscount={(discountData) => {
              setAppliedDiscount({
                code: discountData.code,
                amount: discountData.discountAmount,
                id: discountData.discountId,
                name: discountData.discountName,
                orderAmount: calculations.totalAmount,
              });
              setDiscountError(null);
              setValue('discountCode', discountData.code);
            }}
            onRemoveDiscount={() => {
              setAppliedDiscount(null);
              setDiscountError(null);
              setValue('discountCode', undefined);
            }}
            onDoNotCallChange={setDoNotCall}
            form={form}
          />
        </div>
      </div>
    </form>
  );
};

export const CheckoutForm = memo(CheckoutFormComponent);

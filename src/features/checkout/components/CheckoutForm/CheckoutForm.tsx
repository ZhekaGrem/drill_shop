'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { Alert, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCheckout } from '../../hooks/useCheckout';
import { useDeliveryFields } from '../../hooks/useDeliveryFields';
import { Button } from '@/shared/components/Button/Button';

// Sections
import { ContactInfoSection } from './sections/ContactInfoSection';
import { DeliverySection } from './sections/DeliverySection';
import { PaymentSection } from './sections/PaymentSection';
import { OrderNotesSection } from './sections/OrderNotesSection';
import { OrderSummary } from './OrderSummary/OrderSummary';

import styles from './CheckoutForm.module.scss';

const CheckoutFormComponent = () => {
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
  } | null>(null);

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.checkoutForm}>
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
            <ContactInfoSection form={form} />

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

            {/* Hidden notes field */}
            <input type="hidden" {...form.register('notes')} value={finalNotes} />
          </div>
        </div>

        {/* Right column - order summary */}
        <div className={styles.summaryColumn}>
          <OrderSummary
            items={items}
            totalAmount={calculations.totalAmount}
            appliedDiscount={appliedDiscount}
            doNotCall={doNotCall}
            isSubmitting={isSubmitting}
            isCartLoading={isCartLoading}
            onApplyDiscount={(discountData) => {
              setAppliedDiscount({
                code: discountData.code,
                amount: discountData.discountAmount,
                id: discountData.discountId,
                name: discountData.discountName,
              });
              setValue('discountCode', discountData.code);
            }}
            onRemoveDiscount={() => {
              setAppliedDiscount(null);
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

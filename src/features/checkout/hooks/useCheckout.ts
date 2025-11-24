// src/features/checkout/hooks/useCheckout.ts - FIXED RESPONSE HANDLING
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { Resolver } from 'react-hook-form';
import { useCart } from '@/features/cart/hooks/useCart';
import { notifications } from '@mantine/notifications';
import { CheckoutFormData, checkoutSchema } from '../types';
import { createOrder } from '../api/checkout-api';
import { paymentApi } from '@/features/payment/api/payment-api';
import { useAuthStore } from '@/shared/stores/auth';

const GUEST_CONTACTS_KEY = 'guest_contacts';

export const useCheckout = () => {
  const router = useRouter();
  const { clearCart, calculations } = useCart();
  const { userProfile, isAuthenticated } = useAuthStore();
  const isProfileLoaded = useRef(false);

  const getSavedContacts = () => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(GUEST_CONTACTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to parse guest contacts from localStorage', error);
      return {};
    }
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormData>,
    defaultValues: {
      guestEmail: '',
      notes: '',
      deliveryMethod: 'nova_poshta',
      paymentMethod: 'cash_on_delivery',
      shippingAddress: {
        firstName: '',
        lastName: '',
        address1: '',
        city: '',
        zipCode: '00000',
        country: 'UA',
        phone: '',
      },
      deliveryData: {},
      discountCode: undefined,
      ...getSavedContacts(),
    },
  });

  // Заповнюємо дані з профілю ТІЛЬКИ ОДИН РАЗ при першому завантаженні
  useEffect(() => {
    if (isAuthenticated && userProfile?.email && !isProfileLoaded.current) {
      const currentValues = form.getValues();

      // Заповнюємо тільки якщо поля порожні (перевіряємо firstName як індикатор)
      if (!currentValues.shippingAddress.firstName) {
        const newValues = {
          ...currentValues,
          guestEmail: currentValues.guestEmail || userProfile.email,
          shippingAddress: {
            ...currentValues.shippingAddress,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            phone: userProfile.phone || '',
          },
        };

        form.reset(newValues);
      }

      isProfileLoaded.current = true;
    }
  }, [isAuthenticated, userProfile?.email]);

  useEffect(() => {
    if (!isAuthenticated) {
      const subscription = form.watch((value) => {
        localStorage.setItem(
          GUEST_CONTACTS_KEY,
          JSON.stringify({
            guestEmail: value.guestEmail,
            shippingAddress: value.shippingAddress,
          })
        );
      });
      return () => subscription.unsubscribe();
    }
  }, [isAuthenticated, form.watch]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: createOrder,
    onSuccess: async (orderData) => {
      // FIXED: createOrder тепер повертає OrderData напряму
      if (!orderData?.id || !orderData?.orderNumber) {
        throw new Error('Invalid order response format');
      }

      clearCart();
      if (!isAuthenticated) {
        localStorage.removeItem(GUEST_CONTACTS_KEY);
      }
      localStorage.removeItem('guest_cart_items');

      notifications.show({
        title: 'Замовлення створено!',
        message: `Ваш номер замовлення: ${orderData.orderNumber}`,
        color: 'green',
      });

      const formData = form.getValues();
      const backendPaymentMethod = formData.paymentMethod === 'cash_on_delivery' ? 'cash' : 'card'; // liqpay і monobank → card
      if (formData.paymentMethod === 'cash_on_delivery') {
        router.push(`/orders/success?orderId=${orderData.id}&orderNumber=${orderData.orderNumber}`);
      } else {
        try {
          // Використовуємо totalAmount з відповіді бекенду (вже з урахуванням знижки від промокоду)
          // totalAmount знаходиться в totals об'єкті
          const totalAmount =
            orderData.totals?.totalAmount || orderData.totalAmount || calculations.totalAmount;

          if (!totalAmount || totalAmount <= 0) {
            throw new Error('Invalid total amount');
          }
          const paymentResponse = await paymentApi.createPayment({
            orderId: orderData.id,
            amount: totalAmount,
            paymentMethod: formData.paymentMethod as 'liqpay' | 'monobank' | 'bank_transfer',
            customerEmail: formData.guestEmail,
            returnUrl: `${window.location.origin}/payment/success/${orderData.id}?orderId=${orderData.id}`,
          });

          if (paymentResponse.paymentMethod === 'liqpay' && paymentResponse.html) {
            // Для LiqPay створюємо форму і відправляємо
            const div = document.createElement('div');
            div.innerHTML = paymentResponse.html;
            document.body.appendChild(div);
            const form = div.querySelector('form');
            if (form) {
              form.submit();
            } else {
              throw new Error('LiqPay form not found');
            }
          } else if (paymentResponse.paymentMethod === 'monobank' && paymentResponse.paymentUrl) {
            // Для Monobank - просто редірект
            window.location.href = paymentResponse.paymentUrl;
          } else if (
            paymentResponse.paymentMethod === 'bank_transfer' ||
            paymentResponse.paymentMethod === 'cash'
          ) {
            // Для інших методів - на сторінку успіху
            router.push(`/orders/success?orderId=${orderData.id}&orderNumber=${orderData.orderNumber}`);
          } else {
            throw new Error('Invalid payment response');
          }
        } catch (paymentError) {
          console.error('Payment creation failed:', paymentError);
          router.push(`/orders/success?orderId=${orderData.id}&orderNumber=${orderData.orderNumber}`);
        }
      }
    },
    onError: (err) => {
      notifications.show({
        title: 'Помилка створення замовлення',
        message: err.message || 'Спробуйте ще раз пізніше.',
        color: 'red',
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    console.log('Submitting order with discount code:', data.discountCode); // Debug log

    // Маппінг UI значень в backend значення
    // ВАЖЛИВО: Завжди використовуємо дані з форми для guest полів,
    // навіть для авторизованих користувачів, бо це актуальні дані доставки
    const backendData = {
      ...data,
      paymentMethod: data.paymentMethod === 'cash_on_delivery' ? ('cash' as const) : ('card' as const),
      discountCode: data.discountCode || undefined,
      // Завжди передаємо дані з форми як guest дані
      guestEmail: data.guestEmail || userProfile?.email,
      guestPhone: data.shippingAddress.phone,
      guestFirstName: data.shippingAddress.firstName,
      guestLastName: data.shippingAddress.lastName,
    };

    mutate(backendData as any);
  };

  return { form, onSubmit, isLoading: isPending, error };
};

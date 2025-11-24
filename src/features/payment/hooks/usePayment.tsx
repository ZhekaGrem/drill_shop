// src/features/payment/hooks/usePayment.ts - FIXED
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { paymentApi, CreatePaymentRequest } from '../api/payment-api';

export const useCreatePayment = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: paymentApi.createPayment,
    onSuccess: (data) => {
      if (data.success && data.paymentId) {
        const method = data.paymentMethod || 'cash';

        if (method === 'liqpay') {
          // ✅ LiqPay: показуємо HTML форму яка автоматично відправиться
          if (data.html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.html;
            document.body.appendChild(tempDiv);
            // Форма автоматично сабмітиться через JavaScript в HTML
          } else {
            notifications.show({
              title: 'Помилка',
              message: 'Не вдалося отримати форму LiqPay',
              color: 'red',
            });
          }
        } else if (method === 'monobank') {
          // ✅ Monobank: редіректимо на paymentUrl від Monobank
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            notifications.show({
              title: 'Помилка',
              message: 'Не вдалося отримати посилання на оплату',
              color: 'red',
            });
          }
        } else {
          // Готівка/банківський переказ - на сторінку успіху
          router.push(`/checkout/success?orderId=${data.paymentId}`);
        }
      } else {
        notifications.show({
          title: 'Помилка оплати',
          message: data.message || 'Не вдалося створити платіж',
          color: 'red',
        });
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Помилка оплати',
        message: error.message || 'Не вдалося створити платіж',
        color: 'red',
      });
    },
  });
};

// ✅ FIXED: Правильна типізація для TanStack Query v5
export const usePaymentStatus = (paymentId: string, enabled = true) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentApi.verifyPayment(paymentId),
    enabled: enabled && !!paymentId,
    refetchInterval: (query) => {
      // ✅ Use query.state.data для TanStack Query v5
      const data = query.state.data;
      if (!data?.success) return false;
      return ['PENDING'].includes(data.status) ? 3000 : false;
    },
  });
};

export const useRefundPayment = () => {
  return useMutation({
    mutationFn: ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason?: string }) =>
      paymentApi.refundPayment(paymentId, amount, reason),
    onSuccess: (data) => {
      notifications.show({
        title: data.success ? 'Успіх' : 'Помилка',
        message: data.message,
        color: data.success ? 'green' : 'red',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Помилка',
        message: error.message || 'Не вдалося повернути кошти',
        color: 'red',
      });
    },
  });
};

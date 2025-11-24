// src/features/payment/api/payment-api.ts
import { apiClient } from '@/shared/api';

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  callbackUrl?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  message: string;
  error?: string;
  html?: string;
  paymentMethod?: 'liqpay' | 'monobank' | 'cash' | 'bank_transfer';
}

export interface PaymentStatusResponse {
  success: boolean;
  status: string;
  message: string;
  error?: string;
  orderNumber?: string;
  orderId?: string;
}

export const paymentApi = {
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  },

  verifyPayment: async (paymentId: string): Promise<PaymentStatusResponse> => {
    // ✅ Використовуємо fetch замість apiClient щоб обійти auth interceptor
    // Endpoint /payments/{orderId}/verify має бути публічним на backend
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const response = await fetch(`${API_BASE}/payments/${paymentId}/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    return response.json();
  },

  refundPayment: async (
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; message: string; refundId?: string; error?: string }> => {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  },
};

// src/features/checkout/api/checkout-api.ts
import { apiClient, handleApiResponse, handleApiError } from '@/shared/api';
import { orderEndpoints } from '@/shared/api/endpoints';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  zipCode?: string;
  country: string;
  phone: string;
  email?: string;
}

interface CreateOrderData {
  paymentMethod: 'card' | 'cash' | 'bank_transfer';
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestFirstName?: string;
  guestLastName?: string;
  discountCode?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount?: number; // Deprecated, використовуйте totals.totalAmount
  createdAt: string;
  totals?: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    totalAmount: number;
  };
}

interface OrderResponse {
  success: boolean;
  order: OrderData;
  message: string;
}

export const createOrder = async (orderData: CreateOrderData): Promise<OrderData> => {
  try {
    const finalOrderData = {
      ...orderData,
      guestEmail: orderData.guestEmail || orderData.shippingAddress.email,
      guestPhone: orderData.guestPhone || orderData.shippingAddress.phone,
      guestFirstName: orderData.guestFirstName || orderData.shippingAddress.firstName,
      guestLastName: orderData.guestLastName || orderData.shippingAddress.lastName,
    };

    const response = await apiClient.post<OrderResponse>(orderEndpoints.createOrder, finalOrderData);
    const result = handleApiResponse<OrderResponse>(response, 'Failed to create order');

    return result.order;
  } catch (error: any) {
    throw handleApiError(error, 'Failed to create order');
  }
};

export const trackOrder = async (orderNumber: string) => {
  try {
    const response = await apiClient.get(orderEndpoints.trackOrder(orderNumber));
    const result = handleApiResponse(response, 'Order not found');
    return result.data;
  } catch (error: any) {
    throw handleApiError(error, 'Failed to track order');
  }
};

export const getGuestOrderAccess = async (orderNumber: string, email: string) => {
  try {
    const response = await apiClient.post(orderEndpoints.guestAccess, {
      orderNumber,
      email,
    });
    const result = handleApiResponse(response, 'Access denied');
    return result.data;
  } catch (error: any) {
    throw handleApiError(error, 'Failed to get guest access');
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    const response = await apiClient.post(orderEndpoints.cancelOrder(orderId));
    const result = handleApiResponse(response, 'Failed to cancel order');
    return result.data;
  } catch (error: any) {
    throw handleApiError(error, 'Failed to cancel order');
  }
};

// src/features/admin/hooks/useOrderEdit.ts
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { apiClient } from '@/shared/api/client';
import { Order, Product, PaymentStatus, OrderItem } from '@/shared/types/generated.types';

interface OrderItemEdit extends OrderItem {
  isNew?: boolean;
  isModified?: boolean;
  isRemoved?: boolean;
  newQuantity?: number;
  newUnitPrice?: number;
  product?: Product;
  variant?: { id: string; name?: string; sku: string };
}

interface UseOrderEditReturn {
  order: Order | null;
  items: OrderItemEdit[];
  setItems: React.Dispatch<React.SetStateAction<OrderItemEdit[]>>;
  paymentStatus: PaymentStatus;
  setPaymentStatus: React.Dispatch<React.SetStateAction<PaymentStatus>>;
  availableProducts: Product[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook для завантаження та управління даними замовлення
 */
export const useOrderEdit = (
  orderId: string | undefined,
  form: UseFormReturn<any>
): UseOrderEditReturn => {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItemEdit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const fetchOrder = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      // Завантажуємо список доступних товарів
      const productsResponse = await apiClient.get('/products?limit=100&status=ACTIVE');
      if (productsResponse.data.success) {
        setAvailableProducts(productsResponse.data.data);
      }

      // Завантажуємо дані замовлення
      const response = await apiClient.get(`/admin/orders/${orderId}`);

      if (response.data.success) {
        const orderData = response.data.data;

        setOrder(orderData);
        setItems(orderData.items || []);
        setPaymentStatus(orderData.paymentStatus || PaymentStatus.PENDING);

        // Витягуємо інформацію про клієнта
        const customerData = orderData.user || {};
        let shippingAddr = orderData.shippingAddress || {};

        // Обробка випадку, коли shippingAddress - це JSON рядок
        if (typeof shippingAddr === 'string') {
          try {
            shippingAddr = JSON.parse(shippingAddr);
          } catch (e) {
            console.warn('Failed to parse shipping address:', shippingAddr);
            shippingAddr = {};
          }
        }

        // Заповнюємо форму даними
        form.reset({
          guestEmail: orderData.guestEmail || customerData.email || '',
          guestPhone: orderData.guestPhone || customerData.phone || '',
          guestFirstName:
            orderData.guestFirstName || customerData.firstName || shippingAddr.firstName || '',
          guestLastName: orderData.guestLastName || customerData.lastName || shippingAddr.lastName || '',
          shippingAddress: {
            fullName: `${shippingAddr.firstName || customerData.firstName || ''} ${shippingAddr.lastName || customerData.lastName || ''}`.trim(),
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

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  return {
    order,
    items,
    setItems,
    paymentStatus,
    setPaymentStatus,
    availableProducts,
    isLoading,
    refetch: fetchOrder,
  };
};

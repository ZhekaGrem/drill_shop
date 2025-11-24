// src/features/cart/api/cart-api.ts
import { apiClient, handleApiResponse } from '@/shared/api';
import { cartEndpoints } from '@/shared/api/endpoints';

interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface UpdateCartItemData {
  quantity: number;
}

interface CartItem {
  id: string;
  product: {
    id: string;
    promoType?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const fetchCart = async () => {
  const response = await apiClient.get(cartEndpoints.cart);
  return handleApiResponse(response, 'Failed to fetch cart');
};

export const addToCart = async (data: AddToCartData) => {
  const response = await apiClient.post(cartEndpoints.addToCart, data);
  const result = handleApiResponse(response, 'Failed to add to cart');

  // Перевірка promo fields (бізнес-логіка)
  if (result.data?.items) {
    result.data.items = result.data.items.map((item: CartItem) => {
      if (item.product && !item.product.hasOwnProperty('promoType')) {
        console.warn('Product missing promo fields:', item.product.id);
      }
      return item;
    });
  }

  return result;
};

export const updateCartItem = async (itemId: string, data: UpdateCartItemData) => {
  const response = await apiClient.put(cartEndpoints.updateCartItem(itemId), data);
  return handleApiResponse(response, 'Failed to update cart item');
};

export const removeCartItem = async (itemId: string) => {
  const response = await apiClient.delete(cartEndpoints.removeCartItem(itemId));
  return handleApiResponse(response, 'Failed to remove cart item');
};

export const clearCart = async () => {
  const response = await apiClient.delete(cartEndpoints.clearCart);
  return handleApiResponse(response, 'Failed to clear cart');
};

export const mergeGuestCart = async (
  guestItems: { productId: string; variantId?: string | null; quantity: number }[]
) => {
  const response = await apiClient.post(cartEndpoints.mergeCart, { items: guestItems });
  return handleApiResponse(response, 'Failed to merge cart');
};

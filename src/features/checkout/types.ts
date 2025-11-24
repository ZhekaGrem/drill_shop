// src/features/checkout/types.ts - IMPROVED VALIDATION
import { z } from 'zod';

// Delivery data schema
export const deliveryDataSchema = z.object({
  cityRef: z.string().optional(),
  cityName: z.string().optional(),
  warehouseRef: z.string().optional(),
  warehouseName: z.string().optional(),
});

// Shipping address schema
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "Ім'я є обов'язковим"),
  lastName: z.string().min(1, "Прізвище є обов'язковим"),
  address1: z.string().min(3, 'Введіть повну адресу'),
  city: z.string(), // Може бути порожнім для "Інший спосіб"
  zipCode: z.string().default('00000'),
  country: z.string().default('UA'),
  phone: z.string().regex(/^(\+380\d{9}|0\d{9})$/, 'Введіть телефон у форматі +380XXXXXXXXX або 0XXXXXXXXX'),
});

// Main checkout schema with conditional validation
export const checkoutSchema = z
  .object({
    guestEmail: z.string().email('Неправильний формат email').min(1, "Email є обов'язковим"),
    notes: z.string().optional(),
    deliveryMethod: z.enum(['nova_poshta', 'courier', 'ukr_poshta', 'other'], {
      required_error: 'Виберіть спосіб доставки',
    }),
    paymentMethod: z.enum(['cash_on_delivery', 'liqpay', 'monobank'], {
      required_error: 'Виберіть спосіб оплати',
    }),
    shippingAddress: shippingAddressSchema,
    deliveryData: deliveryDataSchema.optional(),
    discountCode: z.string().optional(),
  })
  .refine(
    (data) => {
      // Conditional validation for Nova Poshta
      if (data.deliveryMethod === 'nova_poshta') {
        return data.deliveryData?.cityRef && data.deliveryData?.warehouseRef;
      }
      return true;
    },
    {
      message: "Для Нової Пошти обов'язково оберіть місто та відділення",
      path: ['deliveryData'],
    }
  )
  .refine(
    (data) => {
      // Для Нової Пошти city має бути заповненим
      if (data.deliveryMethod === 'nova_poshta') {
        return data.shippingAddress.city && data.shippingAddress.city.length > 0;
      }
      return true;
    },
    {
      message: "Місто є обов'язковим для Нової Пошти",
      path: ['shippingAddress', 'city'],
    }
  );

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Validation helper for guest email
export const validateGuestEmail = (data: CheckoutFormData, isAuthenticated: boolean): boolean => {
  if (!isAuthenticated && !data.guestEmail) {
    return false;
  }
  return true;
};

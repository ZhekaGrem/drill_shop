// src/widgets/ProductV2/cart-snapshot.ts
// Снапшот товару для кошика (гостьовий кошик тримає ціну/фото на момент
// додавання). Форма — 1:1 зі сторінкою /catalog/[slug].
import type { Product, ProductVariant } from '@/shared/types';

export const buildCartSnapshot = (product: Product, variant?: ProductVariant) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: variant?.price || product.price,
  unitValue: variant?.unitValue || product.unitValue,
  primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
  variants: product.variants,
  promoType: variant?.promoType || product.promoType,
  promoConfig: variant?.promoConfig || product.promoConfig,
  promoEndsAt: variant?.promoEndsAt || product.promoEndsAt,
});

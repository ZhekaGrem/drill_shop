// src/widgets/ProductV2/card-product.ts
// Товар із GET /collections → картка каталогу (ProductCard). Відповідь колекцій уже несе все,
// що показує картка: фото переду й спини, ціну, розміри з залишками. Тож сітка розділу
// (/zlypni — сто товарів) малюється з того самого запиту, що й герої, без окремого /products.
import { ProductStatus, ProductType } from '@/shared/types/generated.types';
import type { Product, ProductVariant } from '@/shared/types';

export interface ApiCollectionImage {
  id: string;
  url: string;
  kind: string;
  isPrimary: boolean;
  isSecondary?: boolean;
  altText?: string | null;
  sortOrder?: number;
}

export interface ApiCollectionVariant {
  id: string;
  sku: string;
  name?: string | null;
  price: number;
  quantity: number;
  reservedQuantity: number;
  /** Як і в /products: { size: 'M' } — рядки, а не ProductOption зі згенерованих типів */
  options: Record<string, string>;
  sortOrder: number;
}

export interface ApiCollectionProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  reservedQuantity: number;
  hasVariants: boolean;
  collectionOrder: number;
  model3dPath: string | null;
  texture3dUrl: string | null;
  switcherSwatch: string | null;
  images: ApiCollectionImage[];
  variants: ApiCollectionVariant[];
}

// Дат і лічильників у відповіді колекцій нема, і картка їх не читає
const NEVER = new Date(0);

const toVariant = (productId: string, v: ApiCollectionVariant): ProductVariant => ({
  ...v,
  productId,
  price: Number(v.price),
  options: v.options as unknown as ProductVariant['options'],
  isActive: true,
  createdAt: NEVER,
  updatedAt: NEVER,
});

export const toCardProduct = (p: ApiCollectionProduct): Product => ({
  id: p.id,
  sku: p.sku,
  slug: p.slug,
  name: p.name,
  price: Number(p.price),
  quantity: p.quantity,
  reservedQuantity: p.reservedQuantity,
  hasVariants: p.hasVariants,
  // У варіантах колекцій quantity — уже вільний залишок (резерв винесено в reservedQuantity)
  isInStock: p.variants.some((v) => v.quantity > 0),
  status: ProductStatus.ACTIVE,
  productType: ProductType.CLOTHING,
  isActive: true,
  isFeatured: false,
  viewsCount: 0,
  salesCount: 0,
  createdAt: NEVER,
  updatedAt: NEVER,
  images: p.images.map((img) => ({
    ...img,
    productId: p.id,
    sortOrder: img.sortOrder ?? 0,
    isSecondary: img.isSecondary ?? false,
    createdAt: NEVER,
  })),
  variants: p.variants.map((v) => toVariant(p.id, v)),
});

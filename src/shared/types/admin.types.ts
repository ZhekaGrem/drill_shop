import { ProductPromoType, DiscountType } from '@/shared/types/generated.types';
export interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  unitValue?: number;
  quantity: number;
  unit: string;

  isActive: boolean;
  isFeatured: boolean;
  categoryIds: string[];
  options?: Record<string, any>;
  promoType?: ProductPromoType | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

export interface ProductFormProps {
  product?: any;
  onSubmit: (data: { data: any; files?: File[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CategoryFormProps {
  category?: any;
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  sizeGuideImage?: string | null;
  sizeGuideText?: string | null;
  promoType?: ProductPromoType | null;
  promoConfig?: any;
  promoEndsAt?: Date | null;
}

export interface DiscountFormProps {
  discount?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface DiscountFormData {
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  applicableProductIds: string[];
}
export interface UpdateUserRoleData {
  userId: string;
  role: string;
  reason?: string;
}

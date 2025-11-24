// Enums
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
type UnitDisplay = 'шт' | 'кг' | 'г' | 'мл' | 'л';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductType {
  FOOD = 'FOOD',
  CLOTHING = 'CLOTHING',
  ACCESSORIES = 'ACCESSORIES',
  OTHER = 'OTHER',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
  RESTOCKED = 'RESTOCKED',
}
export enum ProductUnit {
  PIECE = 'PIECE',
  KG = 'KG',
  GRAM = 'GRAM',
  LITER = 'LITER',
  ML = 'ML',
}

export enum ProductPromoType {
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  PERCENTAGE_OFF = 'PERCENTAGE_OFF',
  FIXED_DISCOUNT = 'FIXED_DISCOUNT',
  BULK_DISCOUNT = 'BULK_DISCOUNT',
  TIME_LIMITED = 'TIME_LIMITED',
}

export interface BuyXGetYConfig {
  buyQuantity: number;
  getQuantity: number;
}

export interface PercentageOffConfig {
  percentage: number;
  maxDiscount?: number;
}

export interface FixedDiscountConfig {
  amount: number;
}

export interface BulkDiscountConfig {
  minQuantity: number;
  discountPercentage: number;
}

export type PromoConfig = BuyXGetYConfig | PercentageOffConfig | FixedDiscountConfig | BulkDiscountConfig;

// Base Models
export interface User {
  id: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date | null;
  role: UserRole;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export interface UserAddress {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state?: string | null;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  sizeGuideImage?: string | null;
  sizeGuideText?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  costPrice?: number | null;
  unitValue?: number | null;
  quantity: number;
  reservedQuantity: number;
  productType?: ProductType;
  unit?: ProductUnit;
  unitDisplay?: UnitDisplay;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  salesCount: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  categories?: ProductCategory[];
  discounts?: ProductDiscount[];
  images?: ProductImage[];
  primaryImage?: { url: string | null; altText?: string | null } | null;
  tags?: ProductTag[];
  variants?: ProductVariant[];
  reviews?: Review[];
  availableQuantity?: number;
  isInStock?: boolean;
  options?: Record<string, any> | null;
  hasVariants?: boolean;
  comparePrice?: number | null;
  promoType?: ProductPromoType | null;
  promoConfig?: PromoConfig | null;
  promoEndsAt?: Date | null;
}

export interface ProductCategory {
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  category?: Category;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;

  publicId?: string | null;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string | null;
  price: number;
  costPrice?: number | null;
  unitValue?: number | null;
  quantity: number;
  reservedQuantity: number;
  options: Record<string, ProductOption>;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  promoType?: ProductPromoType | null;
  promoConfig?: PromoConfig | null;
  promoEndsAt?: Date | null;
  hasActivePromo?: boolean;
  finalPrice?: number;
}

export interface Discount {
  id: string;
  name: string;
  code?: string | null;
  type: DiscountType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDiscount {
  productId: string;
  discountId: string;
}

export interface ProductOption {
  name: string;
  value: string | number | boolean;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ProductSnapshot {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface ExternalData {
  provider: string;
  referenceId: string;
  [key: string]: string | number | boolean | null;
}

export interface CartItem {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  productId: string;
  variantId?: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestFirstName?: string | null;
  guestLastName?: string | null;
  shippingAddress: Address;
  billingAddress?: Address | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  notes?: string | null;
  internalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: ProductSnapshot;
}

export interface OrderDiscount {
  orderId: string;
  discountId: string;
  amount: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  comment?: string | null;
  createdAt: Date;
  createdBy?: string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  externalId?: string | null;
  externalData?: ExternalData | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string | null;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  content?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface ProductTag {
  productId: string;
  tagId: string;
}

// Extended types with relations
export interface UserWithRelations extends User {
  cartItems?: CartItem[];
  orders?: Order[];
  reviews?: Review[];
  addresses?: UserAddress[];
  sessions?: UserSession[];
}

export interface CategoryWithRelations extends Category {
  parent?: Category | null;
  children?: Category[];
  products?: ProductCategory[];
}

export interface ProductWithRelations extends Product {
  relatedProducts?: Product[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  categories?: ProductCategory[];
  discounts?: ProductDiscount[];
  images?: ProductImage[];
  tags?: ProductTag[];
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface OrderWithRelations extends Order {
  discounts?: OrderDiscount[];
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  user?: User | null;
  payments?: Payment[];
}

// Create/Update types (without auto-generated fields)
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateUser = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateProduct = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateOrder = Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>;

// Utility types for common queries
export type UserSelect = {
  [K in keyof User]?: boolean;
} & {
  cartItems?: boolean;
  orders?: boolean;
  reviews?: boolean;
  addresses?: boolean;
  sessions?: boolean;
};

export type ProductSelect = {
  [K in keyof Product]?: boolean;
} & {
  categories?: boolean;
  images?: boolean;
  variants?: boolean;
  reviews?: boolean;
  tags?: boolean;
};

export type OrderSelect = {
  [K in keyof Order]?: boolean;
} & {
  items?: boolean;
  user?: boolean;
  payments?: boolean;
  discounts?: boolean;
  statusHistory?: boolean;
};

export interface CartSessionInfo {
  sessionId: string;
  isGuest: boolean;
}

export interface CartValidationWarning {
  itemId: string;
  message: string;
  type: 'stock' | 'price' | 'availability';
}

// src/shared/api/endpoints.ts - ВИПРАВЛЕНО

// ============== AUTHENTICATION ENDPOINTS ==============
export const authEndpoints = {
  // Basic auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',

  // Password management
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',

  // Email verification
  verifyEmail: '/auth/verify-email',
  resendVerification: '/auth/resend-verification',

  // Session management
  logoutAll: '/auth/logout-all',
  sessions: '/auth/sessions',
  deleteSession: (sessionId: string) => `/auth/sessions/${sessionId}`,
} as const;

// ============== USER PROFILE ENDPOINTS - ВИПРАВЛЕНО ==============
export const userEndpoints = {
  // Profile management
  profile: '/profile',
  updateProfile: '/profile',
  deleteAccount: '/profile',

  // Address management
  addresses: '/profile/addresses',
  address: (id: string) => `/profile/addresses/${id}`,
  setDefaultAddress: (id: string) => `/profile/addresses/${id}/default`,

  // Favorites - ДОДАНО
  favorites: '/profile/favorites',
  addFavorite: '/profile/favorites',
  toggleFavorite: '/profile/favorites/toggle',
  clearFavorites: '/profile/favorites',
  checkFavorite: (productId: string) => `/profile/favorites/${productId}/check`,

  // Recently viewed - ДОДАНО
  recentlyViewed: '/profile/recently-viewed',
  addRecentlyViewed: '/profile/recently-viewed',

  // Notifications - ДОДАНО
  notifications: '/profile/notifications',
  markNotificationRead: (id: string) => `/profile/notifications/${id}/read`,
  markAllNotificationsRead: '/profile/notifications/read-all',

  // Order history
  orderHistory: '/profile/orders',
} as const;

// ============== PRODUCT ENDPOINTS ==============
export const productEndpoints = {
  // Product listing and search
  products: '/products',
  search: '/products/search',
  featured: '/products/featured',
  popular: '/products/popular',

  // Single product
  productBySlug: (slug: string) => `/products/${slug}`,

  // Related and filtered
  relatedProducts: (id: string) => `/products/${id}/related`,
  productsByCategory: (categorySlug: string) => `/products/category/${categorySlug}`,

  // Filter options
  filterOptions: '/products/filters/options',
} as const;

// ============== CATEGORY ENDPOINTS ==============
export const categoryEndpoints = {
  // Public category routes
  categories: '/categories',
  navigation: '/categories/navigation',
  categoryBySlug: (slug: string) => `/categories/${slug}`,
} as const;

// ============== CART ENDPOINTS ==============
export const cartEndpoints = {
  // Cart management
  cart: '/cart',
  addToCart: '/cart/items',
  updateCartItem: (itemId: string) => `/cart/items/${itemId}`,
  removeCartItem: (itemId: string) => `/cart/items/${itemId}`,
  clearCart: '/cart',

  // Cart operations
  validateCart: '/cart/validate',
  calculateShipping: '/cart/shipping',
  applyDiscount: '/cart/discount',
  removeDiscount: '/cart/discount',

  // Guest cart migration
  mergeCart: '/cart/merge',
} as const;

// ============== ORDER ENDPOINTS ==============
export const orderEndpoints = {
  // Order management
  orders: '/orders',
  createOrder: '/orders',
  trackOrder: (orderNumber: string) => `/orders/track/${orderNumber}`,
  orderStatus: (id: string) => `/orders/${id}/status`,

  // Order operations
  cancelOrder: (id: string) => `/orders/${id}/cancel`,
  reorder: (id: string) => `/orders/${id}/reorder`,

  // Order documents
  orderInvoice: (id: string) => `/orders/${id}/invoice`,
  orderInvoicePdf: (id: string) => `/orders/${id}/invoice/pdf`,

  // Order support
  reportIssue: (id: string) => `/orders/${id}/report-issue`,
  requestModification: (id: string) => `/orders/${id}/request-modification`,

  // Guest access
  guestAccess: '/orders/guest-access',

  // Review orders
  reviewOrder: (id: string) => `/orders/${id}/review`,
} as const;

// ============== PAYMENT ENDPOINTS ==============
export const paymentEndpoints = {
  // Payment processing
  createPayment: '/payments',
  refundPayment: (paymentId: string) => `/payments/${paymentId}/refund`,
  verifyPayment: (paymentId: string) => `/payments/${paymentId}/verify`,

  // Payment flow (redirects)
  flow: {
    liqpay: (paymentId: string) => `/payment/liqpay/${paymentId}`,
    monobank: (paymentId: string) => `/payment/monobank/${paymentId}`,
    success: (orderId: string) => `/payment/success/${orderId}`,
    failed: (orderId: string) => `/payment/failed/${orderId}`,
  },

  // Webhooks
  webhooks: {
    liqpay: '/payments/webhook/liqpay',
    monobank: '/payments/webhook/monobank',
  },
} as const;

// ============== DISCOUNT ENDPOINTS ==============
export const discountEndpoints = {
  // Public discount operations
  validate: '/discounts/validate',
  apply: '/discounts/apply',
  calculate: '/discounts/calculate',
  recommendations: '/discounts/recommendations',

  // Admin discount management
  admin: {
    list: '/discounts/admin',
    create: '/discounts/admin',
    update: (id: string) => `/discounts/admin/${id}`,
    delete: (id: string) => `/discounts/admin/${id}`,
    stats: (id: string) => `/discounts/admin/${id}/stats`,
  },
} as const;

// ============== REVIEW ENDPOINTS ==============
export const reviewEndpoints = {
  // Public review operations
  reviews: '/reviews',
  createReview: '/reviews',
  productReviews: (productId: string) => `/reviews/product/${productId}`,
  myReviews: '/reviews/my',
  singleReview: (id: string) => `/reviews/${id}`,

  // Review actions
  updateReview: (id: string) => `/reviews/${id}`,
  deleteReview: (id: string) => `/reviews/${id}`,
  markHelpful: (id: string) => `/reviews/${id}/helpful`,
} as const;

export const deliveryEndpoints = {
  // Cities
  popularCities: '/delivery/cities/popular',
  searchCities: '/delivery/cities/search',

  // Warehouses
  warehouses: (cityRef: string) => `/delivery/warehouses/${cityRef}`,
} as const;

// ============== ADMIN ENDPOINTS - ВИПРАВЛЕНО ==============
export const adminEndpoints = {
  // Dashboard
  dashboard: '/admin/dashboard',
  overview: '/admin/overview',
  export: '/admin/export',

  // Product management
  products: {
    list: '/admin/products',
    create: '/admin/products',
    get: (id: string) => `/admin/products/${id}`,
    update: (id: string) => `/admin/products/${id}`,
    delete: (id: string) => `/admin/products/${id}`,
    bulkUpdate: '/admin/products/bulk',
    bulkDelete: '/admin/products/bulk/delete',
    bulkPrice: '/admin/products/bulk/price',
    uploadImages: (id: string) => `/admin/products/${id}/images`,
    deleteImage: (id: string, imageId: string) => `/admin/products/${id}/images/${imageId}`,
    addToCategory: (id: string) => `/admin/products/${id}/categories`,
    removeFromCategory: (id: string, categoryId: string) => `/admin/products/${id}/categories/${categoryId}`,
    createVariant: (id: string) => `/admin/products/${id}/variants`,
    updateVariant: (id: string, variantId: string) => `/admin/products/${id}/variants/${variantId}`,
    import: '/admin/products/import',
    export: '/admin/products/export',
  },

  // Category management
  categories: {
    list: '/admin/categories',
    stats: '/admin/categories/stats',
    create: '/admin/categories',
    update: (id: string) => `/admin/categories/${id}`,
    delete: (id: string) => `/admin/categories/${id}`,
    reorder: '/admin/categories/reorder',
    bulk: '/admin/categories/bulk',
  },

  // Order management
  orders: {
    list: '/admin/orders',
    stats: '/admin/orders/stats',
    pending: '/admin/orders/pending',
    details: (id: string) => `/admin/orders/${id}`,
    updateStatus: (id: string) => `/admin/orders/${id}/status`,
    process: (id: string) => `/admin/orders/${id}/process`,
    cancel: (id: string) => `/admin/orders/${id}/cancel`,
    bulkUpdate: '/admin/orders/bulk-update',
    export: '/admin/orders/export',
    get: (id: string) => `/admin/orders/${id}`,
    update: (id: string) => `/admin/orders/${id}`,
  },

  // User management - ВИПРАВЛЕНО
  users: {
    list: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    delete: (id: string) => `/admin/users/${id}`,
    activate: (id: string) => `/admin/users/${id}/activate`,
    deactivate: (id: string) => `/admin/users/${id}/deactivate`,
    updateRole: (id: string) => `/admin/users/${id}/role`,
    updateStatus: (id: string) => `/admin/users/${id}/status`,
    get: (id: string) => `/admin/users/${id}`,
    bulk: '/admin/users/bulk',
    export: '/admin/users/export',
    statistics: '/admin/users/statistics',
  },

  // Review management
  reviews: {
    list: '/admin/reviews',
    pending: '/admin/reviews/pending',
    stats: '/admin/reviews/stats',
    approve: (id: string) => `/admin/reviews/${id}/approve`,
    reject: (id: string) => `/admin/reviews/${id}/reject`,
    bulk: '/admin/reviews/bulk',
  },

  // System management
  system: {
    health: '/admin/system/health',
    settings: '/admin/system/settings',
    updateSettings: '/admin/system/settings',
  },
} as const;

// ============== COMBINED ENDPOINTS ==============
export const endpoints = {
  auth: authEndpoints,
  user: userEndpoints,
  products: productEndpoints,
  categories: categoryEndpoints,
  cart: cartEndpoints,
  orders: orderEndpoints,
  payments: paymentEndpoints,
  discounts: discountEndpoints,
  reviews: reviewEndpoints,
  admin: adminEndpoints,
  delivery: deliveryEndpoints,
} as const;

// src/app/seo.ts
import { Metadata, Viewport } from 'next';

// Viewport для мобільної оптимізації
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFB800',
};

// Базова SEO конфігурація
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://shchilnuidrill.com'),

  title: {
    default: 'Drill shop | Щільний Drill для вас',
    template: '%s | Drill shop',
  },

  description:
    'Drill shop - офіційний магазин стильного мерчу. Якісний одяг, футболки, худі та аксесуари з доставкою по Україні. мерч від ніжна оксана  Слава КЕДР кучми ',
  keywords: [
    'мерч',
    'ніжна оксана',
    'ніжна оксана пін',
    'ніжна оксана футболка',
    'футболка ніжна оксана',
    'nizhna oksana',
    'Щільний мерч',
    'мерч Слава КЕДР',
    'Слава КЕДР',
    'Слава КЕДР мерч',
    'Слава КЕДР футболка',
    'ніжна оксана мерч',
    'мерч ніжна оксана ',
    'кедр мерч',
    'Badstreet boys',
    'drill shop',
    'drill мерч',
    'мерч drill',
    'український мерч',
    'R4zyob',
    'мерч R4zyob',
    'R4zyob мерч',
  ],

  openGraph: {
    title: 'Drill shop',
    description: 'Офіційний магазин мерчу.  Щільний мерч для вас. ніжна оксана nizhna oksana  Слава КЕДР',
    url: 'https://shchilnuidrill.com',
    siteName: 'Drill shop',
    locale: 'uk_UA',
    type: 'website',
    images: [
      {
        url: '/logo/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Drill shop ніжна оксана nizhna oksana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drill shop ніжна оксана nizhna oksana',
    description: 'Офіційний мерч. Доставка по Україні.',
    images: ['https://shchilnuidrill.com/logo/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
      },
    ],
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: 'https://shchilnuidrill.com',
  },
};

// Генератори метаданих для окремих сторінок
export const pageMetadata = {
  home: (): Metadata => ({
    title: 'Головна',
    description:
      'Замовити мерч онлайн. Щільний мерч від офіційного магазину. Доставка по Україні. ніжна оксана nizhna oksana',
    alternates: {
      canonical: 'https://shchilnuidrill.com',
    },
  }),

  catalog: (): Metadata => ({
    title: 'Каталог',
    description: 'Великий вибір мерчу онлайн.  Щільний мерч з доставкою по Україні від офіційного магазину.',
    alternates: {
      canonical: 'https://shchilnuidrill.com/catalog',
    },
  }),

  product: (product: { name: string; description?: string; price: number; slug: string }): Metadata => ({
    title: product.name,
    description:
      product.description || `Купити ${product.name}. Ціна від ${product.price} грн. Доставка по Україні.`,
    alternates: {
      canonical: `https://shchilnuidrill.com/catalog/${product.slug}`,
    },
  }),

  about: (): Metadata => ({
    title: 'Про нас',
    description: 'Офіційний магазин мерчу Drill shop.  Щільний мерч для справжніх фанатів.',
    alternates: {
      canonical: 'https://shchilnuidrill.com/about',
    },
  }),

  contact: (): Metadata => ({
    title: 'Контакти',
    description: 'Контакти Drill shop. Телефони, адреса, графік роботи.',
    alternates: {
      canonical: 'https://shchilnuidrill.com/contact',
    },
  }),

  // Сторінки без індексації
  cart: (): Metadata => ({
    title: 'Кошик',
    robots: { index: false, follow: false },
  }),

  checkout: (): Metadata => ({
    title: 'Оформлення замовлення',
    robots: { index: false, follow: false },
  }),
};

// Базові структуровані дані
export const structuredData = {
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Drill shop',
    url: 'https://shchilnuidrill.com',
    logo: 'https://shchilnuidrill.com/logo/logo.png',
    image: 'https://shchilnuidrill.com/logo/logo.png',
    description: 'Офіційний магазин мерчу. Щільний мерч з доставкою по Україні',
    telephone: '+380930465811',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Львів',
      addressCountry: 'UA',
    },
    sameAs: ['https://www.instagram.com/r4zyob'],
  }),

  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Drill shop',
    url: 'https://shchilnuidrill.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://shchilnuidrill.com/catalog?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }),

  product: (product: {
    name: string;
    description?: string;
    price: number;
    images?: { url: string }[];
    slug: string;
    sku?: string;
    category?: { name: string };
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0]?.url,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Drill shop',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `https://shchilnuidrill.com/catalog/${product.slug}`,
      priceCurrency: 'UAH',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Drill shop',
      },
    },
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};

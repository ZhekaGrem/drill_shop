// src/app/seo.ts
import { Metadata, Viewport } from 'next';

// Viewport для мобільної оптимізації
export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Базова SEO конфігурація
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://www.shchilnuidrill.com'),

  title: {
    default: 'Drill shop | Щільний Drill для вас',
    template: '%s | Drill shop',
  },

  description:
    'Drill shop — офіційний магазин мерчу. Якісний одяг, футболки, худі та аксесуари з доставкою по Україні.',
  keywords: [
    'мерч',
    'shchilnuidrill',
    'shchilnui drill',
    'щільний дрілл',
    'drill',
    'ніжна оксана',
    'ніжна оксана пін',
    'ніжна оксана футболка',
    'футболка ніжна оксана',
    'nizhna oksana',
    'Щільний мерч',
    'мерч Слава КЕДР',
    'мерч КЕДР',
    'КЕДР мерч',
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
    'Ніжна Оксана мерч',
    'Проклятий хуй мерч',
    'мерч Проклятий хуй',
    'Проклятий хуй футболка',
    'Антон Хендрікс',
    'пін Ніжна Оксана',
    'BSB Studio',
    'BSB Production',
  ],

  openGraph: {
    title: 'Drill shop — офіційний магазин мерчу',
    description: 'Якісний одяг, футболки, худі та аксесуари з доставкою по Україні.',
    url: 'https://www.shchilnuidrill.com',
    siteName: 'Drill shop',
    locale: 'uk_UA',
    type: 'website',
    images: [
      {
        url: 'https://www.shchilnuidrill.com/logo/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Drill shop — офіційний магазин мерчу',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drill shop — офіційний магазин мерчу',
    description: 'Якісний одяг, футболки, худі та аксесуари з доставкою по Україні.',
    images: ['https://www.shchilnuidrill.com/logo/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: '/assets/favicon/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: 'https://www.shchilnuidrill.com/assets/favicon/favicon.ico' },
      { url: '/assets/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/assets/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/assets/favicon/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [{ url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/assets/favicon/android-chrome-192x192.png',
    other: [
      {
        rel: 'mask-icon',
        url: 'https://www.shchilnuidrill.com/assets/favicon/favicon.ico',
      },
    ],
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: 'https://www.shchilnuidrill.com',
  },
};

// Генератори метаданих для окремих сторінок
export const pageMetadata = {
  home: (): Metadata => ({
    title: 'Головна',
    description:
      'Замовити мерч онлайн. Футболки, худі та аксесуари від офіційного магазину з доставкою по Україні.',
    alternates: {
      canonical: 'https://www.shchilnuidrill.com',
    },
  }),

  catalog: (): Metadata => ({
    title: 'Каталог',
    description: 'Великий вибір мерчу онлайн.  Щільний мерч з доставкою по Україні від офіційного магазину.',
    alternates: {
      canonical: 'https://www.shchilnuidrill.com/catalog',
    },
  }),

  product: (product: { name: string; description?: string; price: number; slug: string }): Metadata => ({
    title: product.name,
    description:
      product.description || `Купити ${product.name}. Ціна від ${product.price} грн. Доставка по Україні.`,
    alternates: {
      canonical: `https://www.shchilnuidrill.com/catalog/${product.slug}`,
    },
  }),

  about: (): Metadata => ({
    title: 'Про нас',
    description: 'Офіційний магазин мерчу Drill shop.  Щільний мерч для справжніх фанатів.',
    alternates: {
      canonical: 'https://www.shchilnuidrill.com/about',
    },
  }),

  contact: (): Metadata => ({
    title: 'Контакти',
    description: 'Контакти Drill shop. Телефони, адреса, графік роботи.',
    alternates: {
      canonical: 'https://www.shchilnuidrill.com/contact',
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
    '@id': 'https://www.shchilnuidrill.com/#organization',
    name: 'Drill shop',
    url: 'https://www.shchilnuidrill.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.shchilnuidrill.com/logo/logo.png',
    },
    image: 'https://www.shchilnuidrill.com/logo/logo.png',
    description: 'Офіційний магазин мерчу. Футболки, худі та аксесуари з доставкою по Україні',
    email: 'team@shchilnuidrill.com',
    telephone: '+380930465811',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+380930465811',
      contactType: 'customer service',
      areaServed: 'UA',
      availableLanguage: 'uk',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Львів',
      addressCountry: 'UA',
    },
    sameAs: ['https://www.instagram.com/r4zyob', 'https://t.me/makaron_gang'],
  }),

  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.shchilnuidrill.com/#website',
    name: 'Drill shop',
    url: 'https://www.shchilnuidrill.com',
    inLanguage: 'uk',
    publisher: {
      '@id': 'https://www.shchilnuidrill.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.shchilnuidrill.com/catalog?search={search_term_string}',
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
    inStock?: boolean;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map((img) => img.url) || [],
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Drill shop',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `https://www.shchilnuidrill.com/catalog/${product.slug}`,
      priceCurrency: 'UAH',
      price: product.price,
      priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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

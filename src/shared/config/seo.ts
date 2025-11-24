// src/shared/config/seo.ts
import { Metadata, Viewport } from 'next';

// Viewport для мобільної оптимізації
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Базова SEO конфігурація
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://selotasalo.shop'),

  title: {
    default: "Selo ta Salo | Свіже м'ясо від ферми",
    template: '%s | Selo ta Salo',
  },

  description:
    "Купити свіже м'ясо онлайн. Фермерські продукти найвищої якості. Доставка по всій Україні за 24 години.",

  openGraph: {
    title: 'Selo ta Salo',
    description: "Свіже м'ясо від виробника. Доставка по Україні.",
    url: 'https://selotasalo.shop',
    siteName: 'Selo ta Salo',
    locale: 'uk_UA',
    type: 'website',
    images: [
      {
        url: '/logo/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Selo ta Salo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selo ta Salo',
    description: 'Свіже м`ясо від виробника. Доставка по Україні.',
    images: ['https://selotasalo.shop/logo/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
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

  alternates: {
    canonical: 'https://selotasalo.shop',
  },
};

// Генератори метаданих для окремих сторінок
export const pageMetadata = {
  home: (): Metadata => ({
    title: 'Головна',
    description: "Замовити свіже м'ясо онлайн. Власне виробництво. Доставка по Україні.",
    alternates: {
      canonical: 'https://selotasalo.shop',
    },
  }),

  catalog: (): Metadata => ({
    title: 'Каталог',
    description: "Великий вибір свіжого м'яса. Свинина, яловичина, курка. Ціни від виробника.",
    alternates: {
      canonical: 'https://selotasalo.shop/catalog',
    },
  }),

  product: (product: { name: string; description?: string; price: number; slug: string }): Metadata => ({
    title: product.name,
    description:
      product.description || `Купити ${product.name}. Ціна від ${product.price} грн. Доставка по Україні.`,
    alternates: {
      canonical: `https://selotasalo.shop/catalog/${product.slug}`,
    },
  }),

  about: (): Metadata => ({
    title: 'Про нас',
    description: "Дізнайтеся про нашу ферму. Власне виробництво м'яса. Екологічно чисті продукти.",
    alternates: {
      canonical: 'https://selotasalo.shop/about',
    },
  }),

  contact: (): Metadata => ({
    title: 'Контакти',
    description: 'Контакти Selo ta Salo. Телефони, адреса, графік роботи.',
    alternates: {
      canonical: 'https://selotasalo.shop/contact',
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
    name: 'Selo ta Salo',
    url: 'https://selotasalo.shop',
    logo: 'https://selotasalo.shop/logo/logo.png',
    image: 'https://selotasalo.shop/logo/logo.png',
    description: "Фермерські м'ясні продукти з доставкою по Україні",
    telephone: '+380930465811',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Львів',
      addressCountry: 'UA',
    },
    sameAs: ['https://www.tiktok.com/@selo_ta_salo', 'https://www.instagram.com/selo_ta_salo'],
  }),

  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Selo ta Salo',
    url: 'https://selotasalo.shop',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://selotasalo.shop/catalog?search={search_term_string}',
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
    image: product.images?.[0]?.url || 'https://selotasalo.shop/logo/logo.png',
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Selo ta Salo',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `https://selotasalo.shop/catalog/${product.slug}`,
      priceCurrency: 'UAH',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Selo ta Salo',
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

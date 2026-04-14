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
    sameAs: [
      'https://www.instagram.com/r4zyob',
      'https://t.me/makaron_gang',
      'https://www.youtube.com/@ShchilnuiDRILL',
      'https://www.tiktok.com/@shchilnuidrillstudio',
      'https://soundcloud.com/user-128119866-528294401',
      'https://soundcloud.com/erythroleukoplakiarec',
      'https://open.spotify.com/artist/2fg0ORMp9fg8rxo7x5xpKR',
      'https://open.spotify.com/artist/5opQ0dBye5KCmz5CDzaMrl',
    ],
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
    aggregateRating?: { averageRating: number; totalReviews: number };
    reviews?: {
      author: string;
      rating: number;
      title?: string;
      content?: string;
      createdAt: string;
    }[];
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
      availability:
        product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Drill shop',
      },
    },
    ...(product.aggregateRating && product.aggregateRating.totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.aggregateRating.averageRating.toFixed(2)),
            reviewCount: product.aggregateRating.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(product.reviews && product.reviews.length > 0
      ? {
          review: product.reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            datePublished: r.createdAt,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.title ? { name: r.title } : {}),
            ...(r.content ? { reviewBody: r.content } : {}),
          })),
        }
      : {}),
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

  faqPage: (items: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }),

  itemList: (products: { name: string; slug: string; image?: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.shchilnuidrill.com/catalog/${p.slug}`,
      name: p.name,
      ...(p.image ? { image: p.image } : {}),
    })),
  }),
};

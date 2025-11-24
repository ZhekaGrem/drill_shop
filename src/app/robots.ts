// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/profile/*',
          '/cart',
          '/checkout',
          '/checkout/*',
          '/payment/*',
          '/orders/success',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/resend-verification',
          '/auth/*',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://selotasalo.shop/sitemap.xml',
  };
}

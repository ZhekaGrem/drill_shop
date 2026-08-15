import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Дев-доступ із локальної мережі (телефон тощо): без цього Next 16 мовчки
  // блокує cross-origin запити до чанків — сторінка вантажиться, а lazy-сцена
  // висне без помилки. Стосується ЛИШЕ dev-сервера, на прод не впливає.
  allowedDevOrigins: ['192.168.0.171'],
  typescript: {
    // ✅ Enable type checking during build for production safety
    ignoreBuildErrors: false,
  },
  // ✅ Видаляємо console.* в production (крім error)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'], // Залишаємо error та warn для critical logs
          }
        : false,
  },

  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  trailingSlash: false,
  // `output: 'standalone'` тут стояло помилково: проєкт їде на Vercel, а не
  // self-host. У Next 16 standalone забирає трасування файлів у .next/standalone,
  // і білдер Vercel падає на пошуку .next/next-server.js.nft.json:
  //   Error: ENOENT: no such file or directory, open
  //   '/vercel/path0/.next/next-server.js.nft.json'
  // Vercel робить трасування сам — окремий standalone-вивід йому не потрібен.
  // Повертати цей рядок можна тільки разом із переїздом на власний сервер/Docker.
  images: {
    // ✅ Enable Next.js image optimization (безкоштовно!)
    unoptimized: false,
    // Локальні src із query (?v=N — версіонування кешу фолбеків 3D-дизайнів):
    // без цього next/image у Next 16 кидає unconfigured-localpatterns.
    // '/**' зберігає стару поведінку «будь-який локальний шлях» + дозволяє query.
    localPatterns: [{ pathname: '/**' }],
    // Cloudinary залишається як джерело картинок
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Оптимізація форматів
    formats: ['image/webp'],
    // Розміри для responsive images
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Dev-проксі до бекенда: телефон відкриває сайт по LAN-адресі, а бекенд
  // дозволяє CORS лише для своїх доменів і localhost. Через same-origin
  // /api/v1/* запит іде з дев-сервера, тож CORS не застосовується.
  // На проді не діє: там фронт ходить на API напряму (NEXT_PUBLIC_API_URL).
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const target = process.env.NEXT_PUBLIC_API_URL;
    if (!target) return [];
    return [{ source: '/api/v1/:path*', destination: `${target}/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;

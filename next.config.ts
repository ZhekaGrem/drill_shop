import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  output: 'standalone',
  images: {
    // ✅ Enable Next.js image optimization (безкоштовно!)
    unoptimized: false,
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
    formats: ['image/webp', 'image/avif'],
    // Розміри для responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;

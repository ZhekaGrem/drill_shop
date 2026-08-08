import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import '@mantine/core/styles.css';
import { Providers } from '@/shared/providers/Providers';
import { LayoutWrapper } from './LayoutWrapper';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
import { baseMetadata, siteViewport, structuredData } from './seo';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from './JsonLd';

// Шрифти e-Ukraine (Diia redesign) — офіційні шрифти thedigital.gov.ua/fonts, CC BY 4.0
const eUkraine = localFont({
  src: [
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

const eUkraineHead = localFont({
  src: [
    { path: '../../public/fonts/e-ukraine/e-UkraineHead-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-UkraineHead-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-heading',
  display: 'swap',
});

export const viewport = siteViewport;
export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" dir="ltr">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${eUkraine.variable} ${eUkraineHead.variable}`}
        style={
          {
            '--font-condensed': 'var(--font-body)',
            '--font-price': 'var(--font-body)',
            '--font-mono': 'var(--font-body)',
          } as React.CSSProperties
        }>
        <JsonLd data={structuredData.organization()} />
        <JsonLd data={structuredData.website()} />
        <GoogleAnalytics gaId="G-2DZN3ZESDB" />
        <Providers>
          <LayoutWrapper>
            <ErrorBoundary>{children}</ErrorBoundary>
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

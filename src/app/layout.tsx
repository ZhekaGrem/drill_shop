import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono, Rubik, Rubik_Glitch } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import { Providers } from '@/shared/providers/Providers';
import { LayoutWrapper } from './LayoutWrapper';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
import { baseMetadata, viewport, structuredData } from './seo';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from './JsonLd';

// Шрифти з Figma "Щільний дріл"
const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-body',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  variable: '--font-condensed',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const rubik = Rubik({
  variable: '--font-price',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

// Rubik Glitch для заголовків (pixel art/glitch стиль) - з Google Fonts
const rubikGlitch = Rubik_Glitch({
  variable: '--font-heading',
  subsets: ['latin', 'cyrillic'],
  weight: '400',
  display: 'swap',
});

export { viewport };
export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSansCondensed.variable} ${ibmPlexMono.variable} ${rubik.variable} ${rubikGlitch.variable}`}>
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

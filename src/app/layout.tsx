import type { Metadata } from 'next';
import { Oswald, Nunito } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import { Providers } from '@/shared/providers/Providers';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
// import { ChatWidget } from '@/widgets/ChatWidget/ChatWidget';
import { baseMetadata, viewport, structuredData } from '@/shared/config/seo';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from '@/shared/components/JsonLd';

const OswaldSans = Oswald({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

const NunitoSans = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
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
      <body className={`${OswaldSans.variable} ${NunitoSans.variable}`}>
        <JsonLd data={structuredData.organization()} />
        <JsonLd data={structuredData.website()} />
        <GoogleAnalytics gaId="G-FVGL0F07DQ" />
        <Providers>
          <Header />
          <main>
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Footer />
          {/* <ChatWidget /> */}
        </Providers>
      </body>
    </html>
  );
}

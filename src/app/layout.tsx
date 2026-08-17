import type { Metadata } from 'next';
import localFont from 'next/font/local';
// Порядок цих двох рядків має значення. Mantine має власне глобальне правило
// body { color: var(--mantine-color-text) } тієї самої специфічності, що й наше
// html, body { color: var(--text-primary) } у globals.css. Поки Mantine
// підключався ДРУГИМ, він вигравав каскад, і вночі весь документ успадковував
// чорний текст на графітовому фоні. Наші стилі мають іти останніми.
import '@mantine/core/styles.css';
import './globals.css';
import { Providers } from '@/shared/providers/Providers';
import { LayoutWrapper } from './LayoutWrapper';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
import { baseMetadata, siteViewport, structuredData } from './seo';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from './JsonLd';
import { Splash } from '@/shared/components/SiteLoader/Splash';

// Шрифти e-Ukraine (Diia redesign) — офіційні шрифти thedigital.gov.ua/fonts, CC BY 4.0
//
// Bold (700) додано навмисно. Раніше в проєкті лежали тільки Light/Regular/Medium,
// і з цього був зроблений висновок, що важчих ваг у e-Ukraine «не існує». Вони існують:
// у застосунку Дії заголовки екранів («Меню», «Сервіси», «Привіт, …») набрані саме Bold,
// і це єдиний важкий елемент на екрані — весь контраст ієрархії тримається на ньому.
// Без 700 сторінка виходила рівно-легкою, тобто плоскою.
const eUkraine = localFont({
  src: [
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-Ukraine-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
});

const eUkraineHead = localFont({
  src: [
    { path: '../../public/fonts/e-ukraine/e-UkraineHead-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-UkraineHead-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/e-ukraine/e-UkraineHead-Bold.woff2', weight: '700', style: 'normal' },
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
  // suppressHydrationWarning: інлайн-скрипт у <head> ставить data-theme ДО
  // гідрації, тож атрибути <html> на клієнті свідомо інші, ніж у SSR-HTML
  return (
    <html lang="uk" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Дизайн-концепція і тема ДО першого кадру (без блимання). Дзеркало
            правил shared/config/design.ts + theme.ts: явний вибір теми
            перекриває автоматику; авто залежить від дизайну — стрітвір завжди
            темний, Cupertino за системою, решта за годинником 18:00–6:00 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;var ds=localStorage.getItem('design');if(ds==='cupertino'||ds==='streetwear'||ds==='tactile'){d.setAttribute('data-design',ds);}else{ds=null;}var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){if(ds==='streetwear'){t='dark';}else if(ds==='cupertino'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{var h=new Date().getHours();t=h>=18||h<6?'dark':'light';}}d.setAttribute('data-theme',t);d.setAttribute('data-mantine-color-scheme',t);}catch(e){}})();",
          }}
        />
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
        {/* Сплеш першого відкриття: SSR-иться в перший HTML, зникає після
            гідрації. Живе поза Providers — йому не потрібен жоден контекст */}
        <Splash />
        <Providers>
          <LayoutWrapper>
            <ErrorBoundary>{children}</ErrorBoundary>
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

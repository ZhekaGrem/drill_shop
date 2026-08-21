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
import { DesignClock } from '@/shared/components/DesignClock/DesignClock';
import { DESIGN_IDS } from '@/shared/config/design';
import { rotationSnippet } from '@/shared/config/design-rotation';

// Дизайн і тема ДО першого кадру (без блимання). Скрипт — рядок, імпортів у
// нього не занести, тож правила теми тут дослівно дублюють theme.ts: міняєш
// там — онови і тут. А от ДАНІ дизайну не дублюються: список id приходить з
// DESIGN_IDS, порядок і крок ротації — з rotationSnippet(), обидва зібрані з
// тих самих констант, що їх читає React. Розʼїхатись їм нема на чому.
//
// Порядок гілок важливий: спершу ds отримує значення (явний вибір → 'diia' →
// ротація), і лише потім за ним рахується авто-тема, бо правило теми залежить
// від дизайну.
const bootScript =
  `(function(){try{var d=document.documentElement;` +
  `var IDS=${JSON.stringify(DESIGN_IDS)};` +
  `var ds=localStorage.getItem('design');` +
  // Немає явного вибору (або сміття у сховищі) — вмикається календар.
  // 'diia' присвоюється ПЕРЕД ротацією, щоб при вимкненому рубильнику
  // (rotationSnippet() порожній) ds лишався валідним, а не null.
  `if(IDS.indexOf(ds)<0){ds='diia';${rotationSnippet()}}` +
  `if(ds!=='diia'){d.setAttribute('data-design',ds);}` +
  `var t=localStorage.getItem('theme');` +
  `if(t!=='dark'&&t!=='light'){` +
  `if(ds==='streetwear'){t='dark';}` +
  `else if(ds==='cupertino'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}` +
  `else{var h=new Date().getHours();t=h>=18||h<6?'dark':'light';}}` +
  `d.setAttribute('data-theme',t);d.setAttribute('data-mantine-color-scheme',t);` +
  `}catch(e){}})();`;

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
        {/* Явний вибір перекриває автоматику — і для теми, і для дизайну.
            Складено вище, поруч із константами, з яких збирається. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
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
        {/* Доглядач ротації. Живе тут, а не в LayoutWrapper, бо той віддає
            /telegram раннім return-ом — а сторінки телеграма мають ротуватись
            так само. Контексту йому не треба */}
        <DesignClock />
        <Providers>
          <LayoutWrapper>
            <ErrorBoundary>{children}</ErrorBoundary>
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

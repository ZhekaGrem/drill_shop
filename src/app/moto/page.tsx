// «Дріл Мото» — гра на весь екран (спека docs/superpowers/specs/2026-09-18-drill-moto-game-design.md,
// секція 3). Серверна і статична: ні запитів, ні динамічних API — Next
// збирає її в готовий HTML. Сама гра — статичний бандл public/moto/ в iframe
// (MotoScreen); код гри сайт не імпортує.
import type { Metadata } from 'next';
import { MotoScreen } from './MotoScreen';

const TITLE = 'Дріл Мото — гра';
const DESCRIPTION =
  'Дріл Мото — мототріал у браузері: газ, гальмо, нахил і секундомір. Три ліги треків, рекорди зберігаються на твоєму пристрої.';
const PAGE_URL = 'https://www.ye-dril.com/moto';
const OG_IMAGE = 'https://www.ye-dril.com/assets/og/moto.png';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Є.Дріл',
    locale: 'uk_UA',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Дріл Мото — головне меню гри' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function MotoPage() {
  return <MotoScreen />;
}

// src/app/returns-exchanges/page.tsx
import { Metadata } from 'next';
import ReturnsExchanges from './ReturnsExchanges';
import { siteConfig } from '@/shared/config/site';

export const metadata: Metadata = {
  title: `Повернення та обмін товару | ${siteConfig.name}`,
  description:
    'Детальна інформація про умови повернення та обміну продовольчих товарів відповідно до законодавства України. Права покупця, процедура повернення, терміни.',
  openGraph: {
    title: `Повернення та обмін товару | ${siteConfig.name}`,
    description: 'Умови повернення та обміну товарів згідно з законодавством України',
    url: `${siteConfig.url}/returns-exchanges`,
  },
};

export default function ReturnsExchangesPage() {
  return <ReturnsExchanges />;
}

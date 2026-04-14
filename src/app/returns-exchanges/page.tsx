// src/app/returns-exchanges/page.tsx
import { Metadata } from 'next';
import ReturnsExchanges from './ReturnsExchanges';
import { siteConfig } from '@/shared/config/site';

export const metadata: Metadata = {
  title: `Повернення та обмін товару | ${siteConfig.name}`,
  description:
    'Умови повернення та обміну мерчу (одягу та аксесуарів) у Drill shop відповідно до законодавства України: права покупця, процедура повернення, терміни.',
  openGraph: {
    title: `Повернення та обмін товару | ${siteConfig.name}`,
    description: 'Умови повернення та обміну товарів згідно з законодавством України',
    url: `${siteConfig.url}/returns-exchanges`,
  },
};

export default function ReturnsExchangesPage() {
  return <ReturnsExchanges />;
}

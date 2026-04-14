import type { Metadata } from 'next';
import OrderTestButtons from './OrderTestButtons';

export const metadata: Metadata = {
  title: 'QA test',
  robots: { index: false, follow: false, nocache: true },
};

export default function TestPage() {
  return <OrderTestButtons />;
}

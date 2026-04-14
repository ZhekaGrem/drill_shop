import type { Metadata } from 'next';
import Home from './Home';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Drill shop — офіційний магазин мерчу',
  description:
    'Офіційний магазин мерчу Щільного Drill зі Львова: футболки, худі, постери, касети та аксесуари. Доставка по всій Україні.',
  alternates: { canonical: 'https://www.shchilnuidrill.com' },
};

const page = () => {
  return <Home />;
};

export default page;

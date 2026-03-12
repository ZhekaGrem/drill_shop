import { Metadata } from 'next';
import About from './About';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Про нас',
  description: 'Офіційний магазин мерчу Drill shop. Щільний мерч для справжніх фанатів.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/about',
  },
};

export default function AboutPage() {
  return <About />;
}

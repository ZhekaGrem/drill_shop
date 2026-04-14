import { Metadata } from 'next';
import FAQ from './FAQ';
import { flatFaqItems } from './faq-data';
import { JsonLd } from '../JsonLd';
import { structuredData } from '../seo';

export const metadata: Metadata = {
  title: 'Часті питання',
  description: 'Відповіді на питання про замовлення, доставку, оплату, повернення та обмін в Drill shop.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/faq',
  },
};

const page = () => {
  return (
    <>
      <JsonLd data={structuredData.faqPage(flatFaqItems)} />
      <FAQ />
    </>
  );
};

export default page;

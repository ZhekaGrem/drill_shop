import { Metadata } from 'next';
import FAQ from './FAQ';

export const metadata: Metadata = {
  title: 'Часті питання',
  description: 'Відповіді на питання про замовлення, доставку, оплату, повернення та обмін в Drill shop.',
  alternates: {
    canonical: 'https://www.shchilnuidrill.com/faq',
  },
};

const page = () => {
  return <FAQ />;
};

export default page;

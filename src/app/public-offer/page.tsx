import PublicOffer from './PublicOffer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Договір публічної оферти | Drill shop',
  description:
    'Договір публічної оферти інтернет-магазину Drill shop. Умови продажу товарів, оплати, доставки та повернення.',
  openGraph: {
    title: 'Договір публічної оферти | Drill shop',
    description:
      'Договір публічної оферти інтернет-магазину Drill shop. Умови продажу товарів, оплати, доставки та повернення.',
  },
};

const page = () => {
  return (
    <>
      <PublicOffer />
    </>
  );
};

export default page;
